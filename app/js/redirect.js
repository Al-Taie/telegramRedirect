const linkTypeMap = {
  "/joinchat/": {
    prefix: "tg://join?invite=",
    label: labels.BUTTON_JOIN_CHAT
  },
  "/addstickers/": {
    prefix: "tg://addstickers?set=",
    label: labels.BUTTON_ADD_STICKERS
  },
  "/c/": {
    handle: (path) => {
      const [channel, post] = path.split("/");
      return `tg://privatepost?channel=${channel}&post=${post}`;
    },
    label: labels.BUTTON_JOIN_CHAT
  }
};

let label, redirectLink;
const link = document.getElementById("active_link");
const username = document.getElementById("username");
const path = document.location.pathname;

for (const [prefix, { handle, prefix: linkPrefix, label: linkLabel }] of Object.entries(linkTypeMap)) {
  if (path.startsWith(prefix)) {
    const id = path.replace(prefix, "");
    redirectLink = handle ? handle(id) : linkPrefix + id;
    label = labels[linkLabel];
    break;
  }
}

if (!label) {
  const domain = path.replace(/^\//, "");
  const isPost = domain.split("/");

  if (isPost.length === 2) {
    const [postDomain, postId] = isPost;
    redirectLink = `tg://resolve?domain=${postDomain}&post=${postId}`;
    label = labels.BUTTON_OPEN_POST;
  } else {
    redirectLink = `tg://resolve?domain=${domain}`;
    label = labels.BUTTON_VIEW_TELEGRAM;

    username.innerHTML = document.documentElement.lang === "ar"
      ? `@${domain} ${labels.CONTINUE_TO}`
      : `${labels.CONTINUE_TO} @${domain}`;
  }
}

link.innerHTML = label;
link.href = redirectLink;
document.location = redirectLink;
