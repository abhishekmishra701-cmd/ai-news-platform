# AI News Mobile App Roadmap

## Objective
Build a native-quality AI News mobile experience using the same backend/API and country-attribution logic as the web platform. Do not use a WebView shortcut.

## V1 scope
- English + Hindi from launch
- Home/news feed
- Country and region feeds
- Categories
- Story Reader
- Story Brief and Full Report
- Search
- Authentication where required
- Saved/bookmarked stories
- Breaking-news notifications foundation
- Consistent country attribution with web

## Architecture principles
- Reuse the existing `/api/news` and shared backend contracts.
- Keep country attribution API-authoritative.
- Avoid duplicating business logic between web and mobile.
- Design localization so additional languages can be added without architectural rework.
- Preserve the HTML-entity normalization rules so `&#8216;` / `&#8217;` never appear to users.

## Delivery gates
1. API contract validation
2. Mobile project foundation
3. Navigation + feed
4. Country/region filtering
5. Story Reader + Brief + Full Report
6. Localization
7. Notifications
8. Device testing (Android + iOS)
9. Accessibility/performance testing
10. Full regression + production verification

No milestone is complete until implementation, testing, fixes, regression testing, integration, and release verification pass.
