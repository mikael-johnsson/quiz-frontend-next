import { NextResponse } from "next/server";
import { getPdf } from "@/services/quizService";

const getNonEmptyValues = (values: string[]) => {
  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
};

export async function GET(request: Request) {
  const incomingParams = new URL(request.url).searchParams;

  // Query params can be repeated in the URL: ?themes=history&themes=science
  const themes = getNonEmptyValues(incomingParams.getAll("themes"));
  const difficulties = getNonEmptyValues(incomingParams.getAll("difficulties"));

  try {
    const upstreamResponse = await getPdf(themes, difficulties);

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: "Failed to generate PDF" },
        { status: upstreamResponse.status },
      );
    }

    const pdfArrayBuffer = await upstreamResponse.arrayBuffer();
    const contentDisposition =
      upstreamResponse.headers.get("content-disposition") ??
      'attachment; filename="quiz.pdf"';

    return new NextResponse(pdfArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while generating PDF" },
      { status: 500 },
    );
  }
}
