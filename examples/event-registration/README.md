# Event registration demo

This example demonstrates how to use **html5-qrcode** for a simple event check-in system.
It shows two pages:

- **store.html** – for store owners to scan a participant's QR code and record a visit. If the participant has already checked in at that store, the page shows a red warning message. The scanner pauses for five seconds after each scan so the message stays visible.
- **participant.html** – for participants to scan their own QR code, see how many stores they have visited, and list the store numbers.

Serve the HTML files with a local web server (for example `npx http-server`) and visit
`/examples/event-registration/store.html?num=1` for the first store (replace the
number to select a store) or `/examples/event-registration/participant.html`.

There are 56 stores in total. Check-ins are stored in `localStorage` as a matrix
of participants by store number so each visit is tracked separately.

Both pages include **html5-qrcode** from the CDN:

```html
<script src="https://unpkg.com/html5-qrcode"></script>
```

The demo uses `localStorage` to keep check-in information so it works without a backend server.

Both pages start the scanner with `{ facingMode: "environment" }` so the back camera is preferred.
If it isn't available, they fall back to the default camera automatically.

File uploads are disabled—scanning works only through the camera. If you use
`Html5QrcodeScanner`, pass `supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]`
to hide the **Scan an Image File** option.
