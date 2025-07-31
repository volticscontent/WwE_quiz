import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chelsea Promotional Selection',
  description: 'Created with v0',
  generator: 'v0.dev',
  icons: {
    icon: '/logo.svg',          
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Facebook Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              fbq('init', '1668631617186203');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1668631617186203&ev=TotalPageView&noscript=1"
          />
        </noscript>
        
        {/* UTMify Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                window.pixelId = "688a6bee873469cdc9c6a728";
                var a = document.createElement("script");
                a.setAttribute("async", "");
                a.setAttribute("defer", "");
                a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
                a.onerror = function() {
                  console.warn('UTMify pixel script failed to load (non-critical)');
                };
                document.head.appendChild(a);
              } catch (e) {
                console.warn('UTMify pixel initialization error (non-critical):', e);
              }
            `,
          }}
        />
        
        {/* UTMify UTM Script */}
        <script
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          data-utmify-prevent-xcod-sck
          data-utmify-prevent-subids
          async
          defer
        />

        {/* TikTok Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                !function (w, d, t) {
                  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;n.onerror=function(){console.warn('TikTok pixel script failed to load (non-critical)')};e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

                  ttq.load('D259I0RC77U5781ILVK0');
                  ttq.track('quiz-PageView');
                }(window, document, 'ttq');
              } catch (e) {
                console.warn('TikTok pixel initialization error (non-critical):', e);
              }
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
