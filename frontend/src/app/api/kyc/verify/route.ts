import { NextResponse } from 'next/server';
import { z } from 'zod';

const kycSchema = z.object({
    address: z.string().startsWith('0x'),
    jurisdiction: z.string().length(2),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { address, jurisdiction } = kycSchema.parse(body);

        // TODO: In production, verify with Onfido/Persona here.
        // TODO: Load ADMIN_PRIVATE_KEY from env and call InvestorRegistry.register(address, jurisdiction) + setKYCStatus(true).

        console.log(`[KYC] Simulating verification for ${address} in ${jurisdiction}`);

        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
            success: true,
            message: "KYC Verified Successfully",
            status: "verified"
        });

    } catch (error) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
}
