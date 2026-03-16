#!/usr/bin/env ruby

podfile = ARGV[0]
unless File.exist?(podfile)
  puts "Podfile not found at #{podfile}"
  exit 0
end

content = File.read(podfile)

if content.include?("CODE_SIGNING_ALLOWED")
  puts "Code signing fix already present"
  exit 0
end

patch = <<~RUBY
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        if target.respond_to?(:product_type) && target.product_type == 'com.apple.product-type.bundle'
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end
RUBY

if content.include?("post_install")
  content.sub!(/post_install\s+do\s*\|installer\|/) do |match|
    match + "\n" + patch
  end
else
  content += "\npost_install do |installer|\n" + patch + "end\n"
end

File.write(podfile, content)
puts "Podfile patched for code signing"
