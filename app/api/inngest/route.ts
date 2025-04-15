import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { sendBudgetAlerts } from "../../../inngest/functions";
import { triggerRecurringTransaction, process, sendMonthlyReport } from "../../../inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendBudgetAlerts, 
    triggerRecurringTransaction,
    process,
    sendMonthlyReport
  ],
});
