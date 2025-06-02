import * as React from "react";
import {
  Html,
  Head,
  Body,
  Preview,
  Container,
  Heading,
  Text,
  Section,
  Tailwind,
  Row,
  Column,
} from "@react-email/components";

export function Email({ name, stats, month, insights }: any) {
  return (
    <Html>
      <Head />
      <Preview>Budget Alert</Preview>
      <Tailwind>
        <Body>
          <Container>
            <Heading className="text-center">Monthly Financial Report</Heading>
            <Text>Hello {name},</Text>
            <Text>Here's your financial summary for {month}</Text>
            <Section className="flex flex-col mt-4 p-4 rounded-lg shadow-md bg-gray-100">
              <div className="bg-white w-full">
                <Text>Total Income</Text>
                <Text>₹{stats.totalIncome}</Text>
              </div>
              <div className="bg-white w-[100%]">
                <Text>Total Expenses</Text>
                <Text>₹{stats.totalExpense}</Text>
              </div>
              <div className="bg-white w-[100%]">
                <Text>Net</Text>
                <Text>₹{stats.totalIncome - stats.totalExpense}</Text>
              </div>
            </Section>
            <Section>
              <Heading>Expenses by Category</Heading>
              {Object.entries(stats.categories as Record<string, number>).map(
                ([category, amount]) => (
                  <Row key={category} className="flex justify-between mt-2">
                    <Column className="w-1/2">
                      <Text>{category}</Text>
                    </Column>
                    <Column className="w-1/2 text-right">
                      <Text>₹{amount}</Text>
                    </Column>
                  </Row>
                )
              )}
            </Section>
            <Section>
              <Heading>Welth Insights</Heading>
              {Object.entries(insights).map(([index, insight]) => {
                const typedInsight = insight as string;
                return (
                  <div key={index} className="p-4 rounded-lg shadow bg-white">
                    <p className="text-sm text-gray-700">{typedInsight}</p>
                  </div>
                );
              })}
            </Section>
            <Text>
              Thank you for using expensify. Keep tracking your expenses.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default Email;
