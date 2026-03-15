"use client";

import Script from "next/script";

export function TawkProvider() {
  return (
    <Script id="tawk-to" strategy="lazyOnload">
      {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/69a45e51a705f91c36464794/1jil10rpu';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          if (s0 && s0.parentNode) {
            s0.parentNode.insertBefore(s1,s0);
          } else {
            document.head.appendChild(s1);
          }
        })();
      `}
    </Script>
  );
}
