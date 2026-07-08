import { NextRequest } from "next/server";
import { deleteSheetData } from "@/lib/google-sheets";
import { requireSession, successResponse, errorResponse, logError } from "@/lib/apiUtils";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, context: RouteContext) {
    const session = await requireSession();
    if (!session) return errorResponse("Unauthorized", 401);

    try {
        const { id } = await context.params;
        if (!id) return errorResponse("Missing expense ID", 400);

        await deleteSheetData("Expenses", "ID_Expense", id);

        return successResponse({ id }, 1);
    } catch (error: any) {
        logError("api.finance.expenses.[id]", "DELETE", error);
        return errorResponse(error.message || "Internal Server Error", 500);
    }
}
