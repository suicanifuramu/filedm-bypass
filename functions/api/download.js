import { getDirectUrl } from "../_utils/filedm.js";

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url).searchParams.get("url");
    if (!url) {
      return new Response("Missing 'url' parameter", { status: 400 });
    }
    const channel = new URL(url).pathname.replace(/^\//, "");
    if (!channel) {
      return new Response("Invalid URL", { status: 400 });
    }
    const directUrl = await getDirectUrl(channel);
    return new Response(null, {
      status: 302,
      headers: { Location: directUrl },
    });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
