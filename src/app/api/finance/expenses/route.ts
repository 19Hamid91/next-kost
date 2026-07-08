import { NextRequest } from "next/server";
import { getSheetData, appendSheetData } from "@/lib/google-sheets";
import { requireSession, successResponse, errorResponse, logError } from "@/lib/apiUtils";
import { Expense } from "@/types";

const VALID_CATEGORIES = ["electricity", "water", "internet", "repair", "other"];

export async function GET(req: NextRequest) {
    const session = await requireSession();
    if (!session) return errorResponse("Unauthorized", 401);

    try {
        const { searchParams } = new URL(req.url);
        const now = new Date();
        const targetMonth = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));
        const targetYear = parseInt(searchParams.get("year") ?? String(now.getFullYear()));
        const page = parseInt(searchParams.get("page") ?? "1");
        const limit = parseInt(searchParams.get("limit") ?? "50");
        const kostId = searchParams.get("kostId");

        const periodStart = new Date(targetYear, targetMonth - 1, 1);
        const periodEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const allExpenses = await getSheetData<Expense>("Expenses");

        const filtered = allExpenses.filter((expense) => {
            if (!expense.Date) return false;
            const date = new Date(expense.Date);
            const inPeriod = date >= periodStart && date <= periodEnd;
            // If kostId provided, filter by it; allow records with empty ID_Kost only if no kostId filter applied
            const inKost = kostId ? expense.ID_Kost === kostId : true;
            return inPeriod && inKost;
        });

        filtered.sort((expenseA, expenseB) => new Date(expenseB.Date).getTime() - new Date(expenseA.Date).getTime());

        const totalCount = filtered.length;
        const paginated = filtered.slice((page - 1) * limit, page * limit);

        return successResponse(paginated, totalCount);
    } catch (error: any) {
        logError("api.finance.expenses", "GET", error);
        return errorResponse(error.message || "Internal Server Error", 500);
    }
}

export async function POST(req: NextRequest) {
    const session = await requireSession();
    if (!session) return errorResponse("Unauthorized", 401);

    try {
        const body = await req.json();
        const { date, category, amount, notes, kostId } = body;

        if (!date || isNaN(new Date(date).getTime())) {
            return errorResponse("Invalid date", 400);
        }
        if (!VALID_CATEGORIES.includes(category)) {
            return errorResponse(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`, 400);
        }
        if (!amount || !Number.isInteger(Number(amount)) || Number(amount) <= 0) {
            return errorResponse("Amount must be a positive integer", 400);
        }
        if (!kostId) {
            return errorResponse("Missing kostId", 400);
        }

        const newExpense: Expense = {
            ID_Expense: `EXP-${Date.now()}`,
            ID_Kost: kostId,
            Date: date,
            Category: category,
            Amount: String(amount),
            Notes: notes ?? "",
            Created_At: new Date().toISOString(),
        };

        await appendSheetData("Expenses", newExpense as any);

        return successResponse(newExpense, 1, 201);
    } catch (error: any) {
        logError("api.finance.expenses", "POST", error);
        return errorResponse(error.message || "Internal Server Error", 500);
    }
}
