import Foundation
import StoreKit

class StoreKitHelper: NSObject, SKProductsRequestDelegate, SKPaymentTransactionObserver {

    static let shared = StoreKitHelper()

    var onPurchaseComplete: ((_ productId: String) -> Void)?
    var onPurchaseFailed: ((_ reason: String) -> Void)?
    var onRestoreComplete: ((_ productIds: [String]) -> Void)?

    private var products: [SKProduct] = []
    private var pendingProductId: String?

    override init() {
        super.init()
        SKPaymentQueue.default().add(self)
    }

    func purchase(productId: String) {
        if let product = products.first(where: { $0.productIdentifier == productId }) {
            let payment = SKPayment(product: product)
            SKPaymentQueue.default().add(payment)
        } else {
            pendingProductId = productId
            let request = SKProductsRequest(productIdentifiers: Set([productId]))
            request.delegate = self
            request.start()
        }
    }

    func restorePurchases() {
        SKPaymentQueue.default().restoreCompletedTransactions()
    }

    func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        products.append(contentsOf: response.products)

        if let pid = pendingProductId, let product = response.products.first(where: { $0.productIdentifier == pid }) {
            pendingProductId = nil
            let payment = SKPayment(product: product)
            SKPaymentQueue.default().add(payment)
        } else if pendingProductId != nil {
            pendingProductId = nil
            onPurchaseFailed?("product_not_found")
        }
    }

    func request(_ request: SKRequest, didFailWithError error: Error) {
        pendingProductId = nil
        onPurchaseFailed?("error")
    }

    func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased:
                SKPaymentQueue.default().finishTransaction(transaction)
                onPurchaseComplete?(transaction.payment.productIdentifier)
            case .failed:
                SKPaymentQueue.default().finishTransaction(transaction)
                if let error = transaction.error as? SKError, error.code == .paymentCancelled {
                    onPurchaseFailed?("cancelled")
                } else {
                    onPurchaseFailed?("error")
                }
            case .restored:
                SKPaymentQueue.default().finishTransaction(transaction)
                onPurchaseComplete?(transaction.payment.productIdentifier)
            case .deferred, .purchasing:
                break
            @unknown default:
                break
            }
        }
    }

    func paymentQueueRestoreCompletedTransactionsFinished(_ queue: SKPaymentQueue) {
        let restoredIds = queue.transactions
            .filter { $0.transactionState == .restored }
            .map { $0.payment.productIdentifier }
        onRestoreComplete?(restoredIds)
    }

    func paymentQueue(_ queue: SKPaymentQueue, restoreCompletedTransactionsFailedWithError error: Error) {
        onRestoreComplete?([])
    }
}
