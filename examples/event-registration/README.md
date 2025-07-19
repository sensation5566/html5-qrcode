# Event registration demo

This example demonstrates how to use **html5-qrcode** for a simple event check-in system.
It shows three pages:

- **store.html** – for store owners to scan a participant's QR code and record a visit. If the participant has already checked in at that store, the page shows a red warning message. The scanner pauses for three seconds on successful check-in and one second when showing a warning so the message stays visible. Successful scans display a green message in Chinese like `參加者P001 登錄成功`.
- **participant.html** – for participants to scan their own QR code, see how many stores they have visited, and list the store numbers.
- **stats.html** – displays a table of all stores with a count of check-ins and the participant IDs for each store.

Serve the HTML files with a local web server (for example `npx http-server`) and visit
`/examples/event-registration/store.html?num=1` for the first store (replace the
number to select a store) or `/examples/event-registration/participant.html`.
Opening the pages directly using the `file://` protocol gives each file its own
`localStorage`, so all totals appear as `0`.

There are 56 stores in total. Check-ins are stored in `localStorage` as a matrix
of participants by store number so each visit is tracked separately.

All pages include **html5-qrcode** from the CDN:

```html
<script src="https://unpkg.com/html5-qrcode"></script>
```

The demo uses `localStorage` to keep check-in information so it works without a backend server. Make sure the `PARTICIPANTS` array in `store.html` lists the IDs encoded in your QR codes.

All pages start the scanner with `{ facingMode: "environment" }` so the back camera is preferred.
If it isn't available, they fall back to the default camera automatically.

File uploads are disabled—scanning works only through the camera. If you use
`Html5QrcodeScanner`, pass `supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]`
to hide the **Scan an Image File** option.
