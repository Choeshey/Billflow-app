import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getAuthClient } from "@/lib/client-server-utils";

const styles = StyleSheet.create({
    page: {
        fontFamily:      "Helvetica",
        fontSize:        10,
        padding:         40,
        backgroundColor: "#ffffff",
        color:           "#1e293b",
    },
    header: {
        flexDirection:  "row",
        justifyContent: "space-between",
        marginBottom:   40,
    },
    logo: {
        fontSize:   22,
        fontFamily: "Helvetica-Bold",
        color:      "#7c3aed",
    },
    invoiceLabel: {
        fontSize:  11,
        color:     "#64748b",
        marginTop:  4,
    },
    statusBadge: {
        fontSize:        9,
        fontFamily:      "Helvetica-Bold",
        color:           "#ffffff",
        backgroundColor: "#10b981",
        padding:         "4 10",
        borderRadius:    4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize:      8,
        fontFamily:    "Helvetica-Bold",
        color:         "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom:  8,
    },
    row: {
        flexDirection:  "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    label: {
        color: "#64748b",
    },
    value: {
        fontFamily: "Helvetica-Bold",
        color:      "#1e293b",
    },
    amountBox: {
        backgroundColor: "#f8fafc",
        borderRadius:    8,
        padding:         20,
        marginBottom:    24,
        borderWidth:     1,
        borderColor:     "#e2e8f0",
    },
    amountLabel: {
        fontSize:     9,
        color:        "#64748b",
        marginBottom: 4,
        fontFamily:   "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    amountValue: {
        fontSize:   28,
        fontFamily: "Helvetica-Bold",
        color:      "#7c3aed",
    },
    footer: {
        position:  "absolute",
        bottom:    30,
        left:      40,
        right:     40,
        textAlign: "center",
        color:     "#94a3b8",
        fontSize:  8,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        marginVertical:    16,
    },
});

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const client = await getAuthClient();
        if (!client) {
            return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });
        }

        const { id } = await params;

        const invoice = await prisma.invoice.findFirst({
            where: {
                id,
                clientId: client.sub,
                userId:   client.adminId,
            },
            include: {
                client: { select: { name: true, email: true, company: true } },
                user:   { select: { name: true, email: true } },
            },
        });

        if (!invoice) {
            return NextResponse.json({ success: false, error: "Invoice not found." }, { status: 404 });
        }

        const statusColors: Record<string, string> = {
            PAID:    "#10b981",
            SENT:    "#3b82f6",
            DRAFT:   "#94a3b8",
            OVERDUE: "#ef4444",
        };

        const doc = (
            <Document>
                <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
        <View>
            <Text style={styles.logo}>Billflow</Text>
            <Text style={styles.invoiceLabel}>
            Invoice #{invoice.id.slice(0, 8).toUpperCase()}
        </Text>
        </View>
        <View>
        <Text style={{
        ...styles.statusBadge,
                backgroundColor: statusColors[invoice.status] ?? "#94a3b8",
        }}>
        {invoice.status}
        </Text>
        </View>
        </View>

        {/* Amount */}
        <View style={styles.amountBox}>
        <Text style={styles.amountLabel}>Amount Due</Text>
        <Text style={styles.amountValue}>{formatCurrency(Number(invoice.amount))}</Text>
        </View>

        {/* Dates */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoice Details</Text>
        <View style={styles.row}>
        <Text style={styles.label}>Issue Date</Text>
        <Text style={styles.value}>{formatDate(invoice.issueDate)}</Text>
        </View>
        <View style={styles.row}>
        <Text style={styles.label}>Due Date</Text>
        <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
        </View>
        <View style={styles.row}>
        <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{invoice.status}</Text>
            </View>
            </View>

            <View style={styles.divider} />

        {/* Billed To */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billed To</Text>
        <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 2 }}>
        {invoice.client.name}
        </Text>
        {invoice.client.company && (
            <Text style={{ color: "#64748b", marginBottom: 2 }}>{invoice.client.company}</Text>
        )}
        {invoice.client.email && (
            <Text style={{ color: "#64748b" }}>{invoice.client.email}</Text>
        )}
        </View>

        {/* From */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>From</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 2 }}>
        {invoice.user.name}
        </Text>
        <Text style={{ color: "#64748b" }}>{invoice.user.email}</Text>
        </View>

        {/* Notes */}
        {invoice.notes && (
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={{ color: "#475569" }}>{invoice.notes}</Text>
        </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
            Generated on {formatDate(new Date())} · Thank you for your business!
        </Text>
        </Page>
        </Document>
    );

        const buffer = await renderToBuffer(doc);

        const uint8  = new Uint8Array(buffer);
        return new NextResponse(uint8, {
            status: 200,
            headers: {
                "Content-Type":        "application/pdf",
                "Content-Disposition": `attachment; filename="invoice-${invoice.id.slice(0, 8)}.pdf"`,
                "Content-Length":      buffer.length.toString(),
            },
        });
    } catch (error) {
        console.error("[PDF GENERATION ERROR]", error);
        return NextResponse.json({ success: false, error: "Failed to generate PDF." }, { status: 500 });
    }
}
