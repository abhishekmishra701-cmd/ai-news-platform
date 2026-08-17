# Web V1 Release Order

Web production is the primary release gate before expanding mobile-app implementation.

## Priority order
1. Desktop web production stability
2. Responsive/mobile-web experience
3. English + Hindi localization visible and functional
4. Country/region feed coverage and attribution
5. Story Brief + Full Report regression
6. HTML entity normalization (`&#8216;` / `&#8217;`) regression
7. Full desktop + mobile-web E2E regression
8. Production verification
9. Continue native mobile app implementation using the stable web API/backend contracts

## Parallel work
The native mobile branch may continue only on architecture/API-contract work that does not destabilize the web release. Mobile UI feature work should consume the same stable API contracts and localization model.

## Quality gate
No web milestone is considered complete until desktop, responsive mobile-web, localization, country attribution, story rendering, entity normalization, regression testing, integration, and production verification pass.
