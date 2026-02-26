import ExpoModulesCore
import StoreKit

public class StoreKitIAPModule: Module {
  private var products: [String: Product] = [:]
  private var purchaseTask: Task<Void, Never>? = nil

  public func definition() -> ModuleDefinition {
    Name("StoreKitIAPModule")

    AsyncFunction("getProducts") { (productIds: [String], promise: Promise) in
      Task {
        do {
          let storeProducts = try await Product.products(for: Set(productIds))
          var result: [[String: Any]] = []
          for product in storeProducts {
            self.products[product.id] = product
            result.append([
              "productId": product.id,
              "title": product.displayName,
              "description": product.description,
              "price": product.price.description,
              "localizedPrice": product.displayPrice,
              "currency": product.priceFormatStyle.currencyCode ?? "USD",
              "type": product.type == .autoRenewable ? "autoRenewable" : product.type.rawValue
            ])
          }
          promise.resolve(result)
        } catch {
          promise.reject("GET_PRODUCTS_ERROR", error.localizedDescription)
        }
      }
    }

    AsyncFunction("purchaseProduct") { (productId: String, promise: Promise) in
      Task {
        guard let product = self.products[productId] else {
          // Try to fetch if not cached
          do {
            let storeProducts = try await Product.products(for: [productId])
            guard let product = storeProducts.first else {
              promise.reject("PRODUCT_NOT_FOUND", "Product \(productId) not found")
              return
            }
            self.products[productId] = product
            await self.doPurchase(product: product, promise: promise)
          } catch {
            promise.reject("FETCH_ERROR", error.localizedDescription)
          }
          return
        }
        await self.doPurchase(product: product, promise: promise)
      }
    }

    AsyncFunction("restorePurchases") { (promise: Promise) in
      Task {
        var restoredIds: [String] = []
        for await result in Transaction.currentEntitlements {
          if case .verified(let transaction) = result {
            restoredIds.append(transaction.productID)
          }
        }
        promise.resolve(restoredIds)
      }
    }

    AsyncFunction("checkSubscriptionStatus") { (productId: String, promise: Promise) in
      Task {
        var isActive = false
        for await result in Transaction.currentEntitlements {
          if case .verified(let transaction) = result {
            if transaction.productID == productId {
              isActive = true
              break
            }
          }
        }
        promise.resolve(isActive)
      }
    }
  }

  private func doPurchase(product: Product, promise: Promise) async {
    do {
      let result = try await product.purchase()
      switch result {
      case .success(let verification):
        switch verification {
        case .verified(let transaction):
          await transaction.finish()
          promise.resolve([
            "productId": transaction.productID,
            "transactionId": transaction.id.description,
            "purchaseDate": transaction.purchaseDate.description
          ])
        case .unverified(_, let error):
          promise.reject("VERIFICATION_FAILED", error.localizedDescription)
        }
      case .userCancelled:
        promise.reject("USER_CANCELLED", "Purchase was cancelled by user")
      case .pending:
        promise.reject("PURCHASE_PENDING", "Purchase is pending approval")
      @unknown default:
        promise.reject("UNKNOWN", "Unknown purchase result")
      }
    } catch {
      promise.reject("PURCHASE_ERROR", error.localizedDescription)
    }
  }
}
