import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSubmitMilestoneProof } from '@/lib/hooks'
import { toast } from 'sonner'

export function SubmitProofModal({
    open,
    onOpenChange,
    roundAddress,
    milestoneId
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    roundAddress: string
    milestoneId: number
}) {
    const { submitProof, isPending, isSuccess } = useSubmitMilestoneProof()
    const [proofUrl, setProofUrl] = useState('')

    useEffect(() => {
        if (isSuccess) {
            toast.success('Proof submitted! Awaiting verification.')
            onOpenChange(false)
            setProofUrl('')
        }
    }, [isSuccess, onOpenChange])

    const handleSubmit = () => {
        if (!proofUrl) {
            toast.error('Please provide a proof URL')
            return
        }
        try {
            new URL(proofUrl)
        } catch {
            toast.error('Please enter a valid URL (e.g. https://github.com/...)')
            return
        }
        submitProof(roundAddress, BigInt(milestoneId), proofUrl)
    }

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} title={`Submit Proof - Milestone #${milestoneId + 1}`}>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-gray-600 mb-4">
                        Provide evidence that you've completed this milestone. This can be:
                    </p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-4">
                        <li>GitHub PR or commit link</li>
                        <li>Loom video walkthrough</li>
                        <li>Product demo URL</li>
                        <li>Document or report link</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Proof of Work URL</label>
                    <Input
                        value={proofUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProofUrl(e.target.value)}
                        placeholder="https://github.com/yourrepo/pull/123"
                        className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                        This will be reviewed by investors or protocol admins before funds are released.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !proofUrl}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                        {isPending ? 'Submitting...' : 'Submit Proof'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
