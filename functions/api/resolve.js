import { getDirectUrl } from "../_utils/filedm.js";

export async function onRequestPost(context) {
  try {
    const { url } = await context.request.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "Missing 'url'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const channel = new URL(url).pathname.replace(/^\//, "");
    if (!channel) {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const directUrl = await getDirectUrl(channel);
    return Response.json({ directUrl });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
