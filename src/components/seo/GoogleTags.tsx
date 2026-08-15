import Script from "next/script";
import {
  sanitizeAdsId,
  sanitizeGa4Id,
  sanitizeGtmId,
} from "@/lib/seo/site";

export function GoogleTags({
  ga4Id,
  gtmId,
  adsId,
}: {
  ga4Id?: string;
  gtmId?: string;
  adsId?: string;
}) {
  const gtm = sanitizeGtmId(gtmId ?? "");
  const ga4 = sanitizeGa4Id(ga4Id ?? "");
  const ads = sanitizeAdsId(adsId ?? "");

  if (gtm) {
    return (
      <>
        <Script id="google-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
Date.now(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
      </>
    );
  }

  const tags = [ga4, ads].filter(Boolean);
  if (!tags.length) return null;
  const configCalls = tags
    .map((id) => `gtag('config','${id}');`)
    .join("");

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${tags[0]}`}
        strategy="afterInteractive"
      />
      <Script id="google-gtag" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());${configCalls}`}
      </Script>
    </>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
