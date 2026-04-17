# Device Compatibility Matrix

## 1. Supported Platforms

- Web: modern evergreen browsers
- Android app: React Native build via mobile/
- iOS app: React Native build via mobile/

## 2. Recommended Baseline Targets

- Android: API 26+
- iOS: 13+
- Browser:
  - Chrome 100+
  - Firefox 100+
  - Safari 15+
  - Edge 100+

## 3. Screen/Network Baselines

- Minimum responsive width: 320px
- Tested network profiles:
  - 5G / WiFi: full feature performance
  - 4G: expected normal operation
  - 3G: degraded media performance, functional core workflows
  - Offline: cache-backed read flows where implemented

## 4. Critical Workflow Compatibility Checklist

- Signup/login
- Activity evidence submission
- Teacher review and decision
- Impact dashboard and leaderboard pages
- Notifications and badge visibility

## 5. Test Matrix Template

| Platform | OS Version | Device | Browser/App Build | Result | Notes |
|---|---|---|---|---|---|
| Android | 13 | Mid-range device | latest | Pending | |
| Android | 11 | Budget device | latest | Pending | |
| iOS | 17 | iPhone | latest | Pending | |
| iOS | 15 | iPhone | latest | Pending | |
| Web | macOS | Chrome | latest | Pending | |
| Web | Windows | Edge | latest | Pending | |

## 6. Offline/Degraded Expectations

- Core form inputs must never crash when network drops.
- Media uploads should queue/retry where offline mode exists.
- Leaderboard may show stale cache snapshot until reconnect.
