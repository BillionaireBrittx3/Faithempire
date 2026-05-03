package expo.modules.playbilling

import android.app.Activity
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class PlayBillingModule : Module() {

    private var billingClient: BillingClient? = null
    private val productDetailsCache = mutableMapOf<String, ProductDetails>()
    private var pendingPurchaseProductId: String? = null
    private var isConnected: Boolean = false

    private val purchasesUpdatedListener = PurchasesUpdatedListener { billingResult, purchases ->
        when {
            billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null -> {
                purchases.forEach { handlePurchase(it) }
            }
            billingResult.responseCode == BillingClient.BillingResponseCode.USER_CANCELED -> {
                sendEvent("onPurchaseFailed", mapOf("reason" to "cancelled"))
            }
            else -> {
                sendEvent("onPurchaseFailed", mapOf("reason" to "error"))
            }
        }
    }

    override fun definition() = ModuleDefinition {
        Name("PlayBillingModule")

        Events("onPurchaseComplete", "onPurchaseFailed", "onRestoreComplete")

        OnCreate {
            initBillingClient()
        }

        OnDestroy {
            billingClient?.endConnection()
            billingClient = null
            isConnected = false
        }

        Function("purchase") { productId: String ->
            ensureConnected {
                if (it) {
                    launchPurchase(productId)
                } else {
                    sendEvent("onPurchaseFailed", mapOf("reason" to "billing_unavailable"))
                }
            }
        }

        Function("restorePurchases") {
            ensureConnected {
                if (it) {
                    queryActivePurchases()
                } else {
                    sendEvent("onRestoreComplete", mapOf("productIds" to emptyList<String>()))
                }
            }
        }
    }

    private fun initBillingClient() {
        val ctx = appContext.reactContext ?: return
        billingClient = BillingClient.newBuilder(ctx)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
            )
            .setListener(purchasesUpdatedListener)
            .build()
        connect(null)
    }

    private fun ensureConnected(callback: (Boolean) -> Unit) {
        if (isConnected) {
            callback(true)
            return
        }
        if (billingClient == null) {
            initBillingClient()
        }
        connect(callback)
    }

    private fun connect(callback: ((Boolean) -> Unit)?) {
        val client = billingClient ?: run {
            callback?.invoke(false)
            return
        }
        if (client.isReady) {
            isConnected = true
            callback?.invoke(true)
            return
        }
        client.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                isConnected = billingResult.responseCode == BillingClient.BillingResponseCode.OK
                callback?.invoke(isConnected)
            }

            override fun onBillingServiceDisconnected() {
                isConnected = false
            }
        })
    }

    private fun launchPurchase(productId: String) {
        val client = billingClient ?: return
        val activity: Activity? = appContext.currentActivity
        if (activity == null) {
            sendEvent("onPurchaseFailed", mapOf("reason" to "no_activity"))
            return
        }

        val cached = productDetailsCache[productId]
        if (cached != null) {
            startBillingFlow(activity, cached)
            return
        }

        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(
                listOf(
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(productId)
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build()
                )
            )
            .build()

        client.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
            if (billingResult.responseCode != BillingClient.BillingResponseCode.OK || productDetailsList.isEmpty()) {
                sendEvent("onPurchaseFailed", mapOf("reason" to "product_not_found"))
                return@queryProductDetailsAsync
            }
            val details = productDetailsList.first()
            productDetailsCache[productId] = details
            startBillingFlow(activity, details)
        }
    }

    private fun startBillingFlow(activity: Activity, details: ProductDetails) {
        val client = billingClient ?: return
        val offerToken = details.subscriptionOfferDetails?.firstOrNull()?.offerToken
        if (offerToken == null) {
            sendEvent("onPurchaseFailed", mapOf("reason" to "no_offer"))
            return
        }
        val productParams = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(details)
            .setOfferToken(offerToken)
            .build()
        val flowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(productParams))
            .build()
        val result = client.launchBillingFlow(activity, flowParams)
        if (result.responseCode != BillingClient.BillingResponseCode.OK) {
            sendEvent("onPurchaseFailed", mapOf("reason" to "launch_failed"))
        }
    }

    private fun handlePurchase(purchase: Purchase) {
        if (purchase.purchaseState != Purchase.PurchaseState.PURCHASED) {
            return
        }
        val productId = purchase.products.firstOrNull() ?: return
        val client = billingClient ?: return

        if (!purchase.isAcknowledged) {
            val params = AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchase.purchaseToken)
                .build()
            client.acknowledgePurchase(params) { _ ->
                sendEvent("onPurchaseComplete", mapOf("productId" to productId))
            }
        } else {
            sendEvent("onPurchaseComplete", mapOf("productId" to productId))
        }
    }

    private fun queryActivePurchases() {
        val client = billingClient ?: return
        val params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.SUBS)
            .build()
        client.queryPurchasesAsync(params) { billingResult, purchasesList ->
            if (billingResult.responseCode != BillingClient.BillingResponseCode.OK) {
                sendEvent("onRestoreComplete", mapOf("productIds" to emptyList<String>()))
                return@queryPurchasesAsync
            }
            val active = purchasesList
                .filter { it.purchaseState == Purchase.PurchaseState.PURCHASED }
                .flatMap { purchase ->
                    if (!purchase.isAcknowledged) {
                        val ackParams = AcknowledgePurchaseParams.newBuilder()
                            .setPurchaseToken(purchase.purchaseToken)
                            .build()
                        client.acknowledgePurchase(ackParams) { }
                    }
                    purchase.products
                }
            sendEvent("onRestoreComplete", mapOf("productIds" to active))
        }
    }
}
