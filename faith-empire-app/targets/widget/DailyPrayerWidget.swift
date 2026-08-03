import WidgetKit
import SwiftUI

struct PrayerEntry: TimelineEntry {
    let date: Date
    let prayerTitle: String
    let prayerText: String
    let reference: String
    let category: String
    let isPlaceholder: Bool
}

struct DailyVerseResponse: Codable {
    let reference: String?
    let verseText: String?
    let decodedMessage: String?
    let category: String?
    let prayerTitle: String?
    let prayerText: String?
    let prayerSection: String?
}

struct PrayerProvider: TimelineProvider {
    let apiURL = "https://decodedfaithbiblestudy.lovable.app/api/verses/today"

    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(
            date: Date(),
            prayerTitle: "Daily Prayer",
            prayerText: "Lord, guide my steps today and fill my heart with Your wisdom and peace.",
            reference: "Proverbs 3:5-6",
            category: "Faith",
            isPlaceholder: true
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        fetchPrayer { entry in
            completion(entry)
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        fetchPrayer { entry in
            var calendar = Calendar.current
            calendar.timeZone = TimeZone(identifier: "America/New_York") ?? .current
            let tomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: Date()) ?? Date())
            let timeline = Timeline(entries: [entry], policy: .after(tomorrow))
            completion(timeline)
        }
    }

    private func fetchPrayer(completion: @escaping (PrayerEntry) -> Void) {
        guard let url = URL(string: apiURL) else {
            completion(placeholder(in: .init()))
            return
        }

        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            guard let data = data,
                  error == nil,
                  let verse = try? JSONDecoder().decode(DailyVerseResponse.self, from: data) else {
                completion(placeholder(in: .init()))
                return
            }

            let title = verse.prayerTitle ?? "Daily Prayer"
            let text = verse.prayerText ?? verse.decodedMessage ?? "Open the app for today's prayer."
            let ref = verse.reference ?? ""
            let cat = verse.prayerSection ?? verse.category ?? "Faith"

            completion(PrayerEntry(
                date: Date(),
                prayerTitle: title,
                prayerText: text,
                reference: ref,
                category: cat,
                isPlaceholder: false
            ))
        }
        task.resume()
    }
}

struct SmallWidgetView: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 4) {
                Image(systemName: "hands.sparkles.fill")
                    .font(.system(size: 10))
                    .foregroundColor(Color(red: 0.875, green: 0.675, blue: 0.165))
                Text("DAILY PRAYER")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(Color(red: 0.875, green: 0.675, blue: 0.165))
                    .tracking(1.2)
            }

            Text(entry.prayerTitle)
                .font(.system(size: 13, weight: .bold, design: .serif))
                .foregroundColor(.white)
                .lineLimit(2)

            Text(entry.prayerText)
                .font(.system(size: 11, weight: .regular))
                .foregroundColor(.white.opacity(0.85))
                .lineLimit(4)

            Spacer(minLength: 0)

            if !entry.reference.isEmpty {
                Text(entry.reference)
                    .font(.system(size: 9, weight: .medium, design: .serif))
                    .foregroundColor(Color(red: 0.875, green: 0.675, blue: 0.165).opacity(0.8))
                    .lineLimit(1)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color.black)
    }
}

struct MediumWidgetView: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 5) {
                Image(systemName: "hands.sparkles.fill")
                    .font(.system(size: 11))
                    .foregroundColor(Color(red: 0.875, green: 0.675, blue: 0.165))
                Text("DAILY PRAYER")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(Color(red: 0.875, green: 0.675, blue: 0.165))
                    .tracking(1.2)
                Spacer()
                Text(entry.category)
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(.white.opacity(0.5))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.white.opacity(0.1))
                    .clipShape(Capsule())
            }

            Text(entry.prayerTitle)
                .font(.system(size: 15, weight: .bold, design: .serif))
                .foregroundColor(.white)
                .lineLimit(1)

            Text(entry.prayerText)
                .font(.system(size: 12, weight: .regular))
                .foregroundColor(.white.opacity(0.85))
                .lineLimit(4)
                .fixedSize(horizontal: false, vertical: true)

            Spacer(minLength: 0)

            if !entry.reference.isEmpty {
                HStack {
                    Spacer()
                    Text("— \(entry.reference)")
                        .font(.system(size: 10, weight: .medium, design: .serif))
                        .foregroundColor(Color(red: 0.875, green: 0.675, blue: 0.165).opacity(0.8))
                        .italic()
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color.black)
    }
}

struct LargeWidgetView: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 5) {
                Image(systemName: "hands.sparkles.fill")
                    .font(.system(size: 13))
                    .foregroundColor(Color(red: 0.875, green: 0.675, blue: 0.165))
                Text("DAILY PRAYER")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(Color(red: 0.875, green: 0.675, blue: 0.165))
                    .tracking(1.5)
                Spacer()
                Text(entry.category)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.white.opacity(0.5))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.white.opacity(0.1))
                    .clipShape(Capsule())
            }

            Rectangle()
                .fill(Color(red: 0.875, green: 0.675, blue: 0.165).opacity(0.3))
                .frame(height: 1)
                .padding(.vertical, 2)

            Text(entry.prayerTitle)
                .font(.system(size: 18, weight: .bold, design: .serif))
                .foregroundColor(.white)
                .lineLimit(2)

            Text(entry.prayerText)
                .font(.system(size: 14, weight: .regular))
                .foregroundColor(.white.opacity(0.9))
                .lineSpacing(3)
                .fixedSize(horizontal: false, vertical: true)

            Spacer(minLength: 0)

            if !entry.reference.isEmpty {
                HStack {
                    Spacer()
                    Text("— \(entry.reference)")
                        .font(.system(size: 11, weight: .medium, design: .serif))
                        .foregroundColor(Color(red: 0.875, green: 0.675, blue: 0.165).opacity(0.8))
                        .italic()
                }
            }

            Rectangle()
                .fill(Color(red: 0.875, green: 0.675, blue: 0.165).opacity(0.2))
                .frame(height: 1)

            Text("Decoded Faith Empire")
                .font(.system(size: 9, weight: .medium))
                .foregroundColor(.white.opacity(0.35))
                .tracking(0.8)
                .frame(maxWidth: .infinity)
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color.black)
    }
}

struct LockScreenWidgetView: View {
    let entry: PrayerEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryCircular:
            ZStack {
                AccessoryWidgetBackground()
                Image(systemName: "hands.sparkles.fill")
                    .font(.system(size: 20))
            }
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 3) {
                    Image(systemName: "hands.sparkles.fill")
                        .font(.system(size: 8))
                    Text("DAILY PRAYER")
                        .font(.system(size: 8, weight: .bold))
                        .tracking(0.8)
                }
                Text(entry.prayerTitle)
                    .font(.system(size: 12, weight: .bold, design: .serif))
                    .lineLimit(1)
                Text(entry.prayerText)
                    .font(.system(size: 10))
                    .lineLimit(2)
                    .opacity(0.8)
            }
        case .accessoryInline:
            HStack(spacing: 4) {
                Image(systemName: "hands.sparkles.fill")
                Text(entry.prayerTitle)
            }
        default:
            Text(entry.prayerTitle)
        }
    }
}

@main
struct DailyPrayerWidgetBundle: WidgetBundle {
    var body: some Widget {
        DailyPrayerHomeWidget()
        DailyPrayerLockWidget()
    }
}

struct DailyPrayerHomeWidget: Widget {
    let kind: String = "DailyPrayerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerProvider()) { entry in
            Group {
                if #available(iOS 17.0, *) {
                    DailyPrayerEntryView(entry: entry)
                        .containerBackground(.black, for: .widget)
                } else {
                    DailyPrayerEntryView(entry: entry)
                        .background(Color.black)
                }
            }
        }
        .configurationDisplayName("Daily Prayer")
        .description("See today's prayer from Decoded Faith Empire on your home screen.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct DailyPrayerLockWidget: Widget {
    let kind: String = "DailyPrayerLockWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerProvider()) { entry in
            LockScreenWidgetView(entry: entry)
        }
        .configurationDisplayName("Daily Prayer")
        .description("See today's prayer on your lock screen.")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}

struct DailyPrayerEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: PrayerEntry

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}
