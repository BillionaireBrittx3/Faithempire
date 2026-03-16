#!/usr/bin/env ruby

require 'xcodeproj'

pbxproj_path = ARGV[0]
widget_bundle_id = ARGV[1]

project_path = File.dirname(pbxproj_path)
project = Xcodeproj::Project.open(project_path)

widget_name = "DailyPrayerWidget"

existing = project.targets.find { |t| t.name == widget_name }
if existing
  puts "Widget target already exists, skipping..."
  exit 0
end

puts "Adding #{widget_name} target..."

target = project.new_target(:app_extension, widget_name, :ios, "17.0")
target.build_configurations.each do |config|
  config.build_settings["PRODUCT_BUNDLE_IDENTIFIER"] = widget_bundle_id
  config.build_settings["SWIFT_VERSION"] = "5.0"
  config.build_settings["TARGETED_DEVICE_FAMILY"] = "1,2"
  config.build_settings["IPHONEOS_DEPLOYMENT_TARGET"] = "17.0"
  config.build_settings["CODE_SIGN_ENTITLEMENTS"] = "#{widget_name}/#{widget_name}.entitlements"
  config.build_settings["GENERATE_INFOPLIST_FILE"] = "NO"
  config.build_settings["INFOPLIST_FILE"] = "#{widget_name}/Info.plist"
  config.build_settings["MARKETING_VERSION"] = "1.5.0"
  config.build_settings["CURRENT_PROJECT_VERSION"] = "1"
  config.build_settings["SWIFT_EMIT_LOC_STRINGS"] = "YES"
  config.build_settings["LD_RUNPATH_SEARCH_PATHS"] = "$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"
  config.build_settings["SKIP_INSTALL"] = "YES"
  config.build_settings["CODE_SIGN_STYLE"] = "Automatic"
  config.build_settings["DEVELOPMENT_TEAM"] = ""
end

group = project.new_group(widget_name, widget_name)

swift_ref = group.new_file("#{widget_name}/DailyPrayerWidget.swift")
target.source_build_phase.add_file_reference(swift_ref)

group.new_file("#{widget_name}/Info.plist")
group.new_file("#{widget_name}/#{widget_name}.entitlements")

main_target = project.targets.find { |t| t.product_type == "com.apple.product-type.application" }
if main_target
  embed_phase = project.new(Xcodeproj::Project::Object::PBXCopyFilesBuildPhase)
  embed_phase.name = "Embed App Extensions"
  embed_phase.dst_subfolder_spec = "13"
  embed_phase.dst_path = ""

  build_file = embed_phase.add_file_reference(target.product_reference)
  build_file.settings = { "ATTRIBUTES" => ["RemoveHeadersOnCopy"] }

  main_target.build_phases << embed_phase

  dependency = main_target.add_dependency(target)
end

frameworks_phase = target.frameworks_build_phase
["WidgetKit", "SwiftUI"].each do |framework|
  ref = project.frameworks_group.new_file("System/Library/Frameworks/#{framework}.framework", :sdk_root)
  frameworks_phase.add_file_reference(ref)
end

project.save

puts "Widget target added successfully!"
