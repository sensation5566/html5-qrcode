# Event registration demo

This example demonstrates how to use **html5-qrcode** for a simple event check-in system.
It shows two pages:

- **store.html** – for store owners to scan a participant's QR code and record a visit.
- **participant.html** – for participants to scan their own QR code and see how many stores they have visited.

Serve the HTML files with a local web server (for example `npx http-server`) and visit
`/examples/event-registration/store.html` or `/examples/event-registration/participant.html`.

Both pages include **html5-qrcode** from the CDN:

```html
<script src="https://unpkg.com/html5-qrcode"></script>
```

The demo uses `localStorage` to keep check-in information so it works without a backend server.

Both pages start the scanner with `{ facingMode: { exact: "environment" } }` so that the back camera is used when available.

File uploads are disabled—scanning works only through the camera. If you use
`Html5QrcodeScanner`, pass `supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]`
to hide the **Scan an Image File** option.
