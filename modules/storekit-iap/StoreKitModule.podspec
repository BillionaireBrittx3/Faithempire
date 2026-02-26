Pod::Spec.new do |s|
  s.name           = 'StoreKitModule'
  s.version        = '1.0.0'
  s.summary        = 'StoreKit module for Faith Empire'
  s.description    = 'Native StoreKit integration for in-app purchases'
  s.homepage       = 'https://decodedfaithempire.org'
  s.license        = 'MIT'
  s.author         = 'Decoded Faith Empire'
  s.source         = { git: '' }
  s.platform       = :ios, '15.1'
  s.swift_version  = '5.4'
  s.source_files   = '**/*.swift'
  s.frameworks     = 'StoreKit'
  s.dependency 'ExpoModulesCore'
end
