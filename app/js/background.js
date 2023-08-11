// Create a script element
const script = document.createElement("script");
// Set the source attribute to the helper.js file
script.src = "//telegram.org/js/tgwallpaper.min.js?3";
// Append the script element to the head or body of the document
document.body.appendChild(script);

script.onload = function() {
  const tme_bg = document.getElementById("tgme_background");
  if (tme_bg) {
    TWallpaper.init(tme_bg);
    TWallpaper.animate(true);
    window.onfocus = function() {
      TWallpaper.update();
    };
  }
  document.body.classList.remove("no_transition");

  function toggleTheme(dark) {
    document.documentElement.classList.toggle("theme_dark", dark);
    window.Telegram && Telegram.setWidgetOptions({ dark: dark });
  }

  if (window.matchMedia) {
    const darkMedia = window.matchMedia("(prefers-color-scheme: dark)");
    toggleTheme(darkMedia.matches);
    darkMedia.addListener(function(e) {
      toggleTheme(e.matches);
    });
  }
};