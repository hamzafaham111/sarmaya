import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

// Weekly digest: watchlist movers, portfolio delta, due-for-review theses.
// Numbers only — the thinking is the user's.
export interface DigestEmailProps {
  movers: { symbol: string; changePct: number; url: string }[];
  portfolioLines: string[]; // pre-formatted per-currency summaries
  dueForReview: { symbol: string; statement: string; url: string }[];
}

export function DigestEmail({
  movers,
  portfolioLines,
  dueForReview,
}: DigestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your weekly Sarmaya summary</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f7f9" }}>
        <Container
          style={{
            margin: "24px auto",
            padding: "24px",
            backgroundColor: "#ffffff",
            border: "1px solid #dfe4ea",
            borderRadius: "6px",
            maxWidth: "520px",
          }}
        >
          <Heading as="h2" style={{ margin: "0 0 12px", color: "#18202b" }}>
            Your week in numbers
          </Heading>

          {movers.length > 0 ? (
            <>
              <Text style={{ color: "#5f6b78", margin: "12px 0 4px" }}>
                Watchlist movers (1w)
              </Text>
              {movers.map((m) => (
                <Text
                  key={m.symbol}
                  style={{ margin: "2px 0", color: "#18202b" }}
                >
                  <Link href={m.url} style={{ color: "#2e6fe8" }}>
                    {m.symbol}
                  </Link>{" "}
                  {m.changePct >= 0 ? "+" : ""}
                  {m.changePct.toFixed(1)}%
                </Text>
              ))}
            </>
          ) : null}

          {portfolioLines.length > 0 ? (
            <>
              <Text style={{ color: "#5f6b78", margin: "16px 0 4px" }}>
                Portfolio
              </Text>
              {portfolioLines.map((line) => (
                <Text key={line} style={{ margin: "2px 0", color: "#18202b" }}>
                  {line}
                </Text>
              ))}
            </>
          ) : null}

          {dueForReview.length > 0 ? (
            <>
              <Text style={{ color: "#5f6b78", margin: "16px 0 4px" }}>
                Theses due for review (90+ days)
              </Text>
              {dueForReview.map((t) => (
                <Text
                  key={t.url + t.statement}
                  style={{ margin: "2px 0", color: "#18202b" }}
                >
                  <Link href={t.url} style={{ color: "#2e6fe8" }}>
                    {t.symbol}
                  </Link>{" "}
                  — &ldquo;{t.statement}&rdquo;
                </Text>
              ))}
            </>
          ) : null}

          <Text
            style={{ color: "#8b949e", fontSize: "12px", marginTop: "24px" }}
          >
            Numbers only — the thinking is yours.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
