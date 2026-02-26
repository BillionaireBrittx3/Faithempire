import ExpoModulesCore
import StoreKit

public class StoreKitModule: Module {
    private let helper = StoreKitHelper.shared

    public func definition() -> ModuleDefinition {
        Name("StoreKitModule")

        Events("onPurchaseComplete", "onPurchaseFailed", "onRestoreComplete")

        OnCreate {
            helper.onPurchaseComplete = { [weak self] productId in
                self?.sendEvent("onPurchaseComplete", ["productId": productId])
            }
            helper.onPurchaseFailed = { [weak self] reason in
                self?.sendEvent("onPurchaseFailed", ["reason": reason])
            }
            helper.onRestoreComplete = { [weak self] productIds in
                self?.sendEvent("onRestoreComplete", ["productIds": productIds])
            }
        }

        Function("purchase") { (productId: String) in
            helper.purchase(productId: productId)
        }

        Function("restorePurchases") {
            helper.restorePurchases()
        }
    }
}
