import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { METRIC_LABELS, type Rule } from "@/lib/alerts/rules";

// Thesis-breach alert. Facts only: the user's own rule, the observed value.
// Quiet design matching the tokens; no advice, ever.
export interface BreachEmailProps {
  symbol: string;
  name: string | null;
  statement: string;
  metric: Rule["metric"];
  op: "gt" | "lt";
  threshold: number;
  observed: number;
  firedOn: string;
  instrumentUrl: string;
}

export function BreachEmail({
  symbol,
  name,
  statement,
  metric,
  op,
  threshold,
  observed,
  firedOn,
  instrumentUrl,
}: BreachEmailProps) {
  const metricLabel = METRIC_LABELS[metric].toLowerCase();
  const direction = op === "gt" ? "rose above" : "fell below";

  return (
    <Html>
      <Head />
      <Preview>
        {`Your ${symbol} thesis was breached: ${metricLabel} ${direction} ${String(threshold)}`}
      </Preview>
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
          <Heading as="h2" style={{ margin: "0 0 4px", color: "#18202b" }}>
            Thesis breached: {symbol}
          </Heading>
          <Text style={{ color: "#5f6b78", margin: "0 0 16px" }}>
            {name ?? ""} · {firedOn}
          </Text>

          <Section
            style={{
              backgroundColor: "#f6f7f9",
              borderLeft: "3px solid #2e6fe8",
              padding: "10px 14px",
              marginBottom: "16px",
            }}
          >
            <Text style={{ margin: 0, fontStyle: "italic", color: "#18202b" }}>
              &ldquo;{statement}&rdquo;
            </Text>
          </Section>

          <Text style={{ color: "#18202b" }}>
            The rule you set — <strong>{metricLabel}</strong> {direction}{" "}
            <strong>{threshold}</strong> — tripped today with an observed value
            of <strong>{observed}</strong>.
          </Text>

          <Text style={{ color: "#18202b" }}>
            This is your own rule doing its job, not advice. Re-read your thesis
            and decide for yourself:
          </Text>

          <Text>
            <Link href={instrumentUrl} style={{ color: "#2e6fe8" }}>
              Open your {symbol} page →
            </Link>
          </Text>

          <Text
            style={{ color: "#8b949e", fontSize: "12px", marginTop: "24px" }}
          >
            You won&apos;t be emailed again for this rule unless the condition
            clears and trips anew.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
