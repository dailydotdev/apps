/**
 * A brief's `contentHtml` as the API renders it: markdown-it over the TLDR and
 * one `## title` plus a bullet list per section, each bullet closing with a
 * link to the post it came from, or to a feed of them when there are several.
 */
export const briefContentHtml = `<p>The U.S. government has accused Chinese AI firms of industrial-scale model distillation, while Shopify has acquired Tailwind CSS to ensure its long-term stability.</p>
<h2>Must know</h2>
<ul>
<li><strong>US intelligence labels Chinese AI distillation a national security threat</strong>: A joint advisory accuses six Chinese firms of systematic distillation campaigns against U.S. frontier models. U.S. labs are now being advised to serve subtly degraded responses to suspected distillers to protect their model weights. <a href="https://daily.dev/posts/DMdgOqvwb" target="_blank" rel="noopener nofollow ugc">Read more</a></li>
<li><strong>Shopify acquires Tailwind Labs to anchor the CSS framework</strong>: Tailwind CSS creator Adam Wathan announced that the project and its parent company are joining Shopify to ensure long-term maintenance. <a href="https://daily.dev/posts/5wTLa8J7j" target="_blank" rel="noopener nofollow ugc">Read more</a></li>
<li><strong>Microsoft and Cisco hit by record AI discovered vulnerabilities</strong>: Microsoft released a massive patch batch this month, a surge researchers attribute to AI-assisted discovery tools. <a href="https://daily.dev/feed-by-ids?id=b8aoT91D7&amp;id=KZMXaFvNS" target="_blank" rel="noopener nofollow ugc">Read more</a></li>
</ul>
<h2>Good to know</h2>
<ul>
<li><strong>GitHub Copilot for JetBrains adds enterprise sandbox policies</strong>: Administrators can now centrally control filesystem and network access for Copilot, overriding local developer configs. <a href="https://daily.dev/posts/Qp8dGd3xK" target="_blank" rel="noopener nofollow ugc">Read more</a></li>
</ul>`;

/** The same brief when the briefing service sent no Must know section. */
export const briefContentHtmlWithoutMustKnow = briefContentHtml.replace(
  /<h2>Must know<\/h2>\n<ul>[\s\S]*?<\/ul>\n/,
  '',
);
