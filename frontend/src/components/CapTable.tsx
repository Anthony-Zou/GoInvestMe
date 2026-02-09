import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Users, Percent } from 'lucide-react'

interface CapTableEntry {
    name: string
    equity: number // in percentage
    role?: string
    color: string
}

interface CapTableProps {
    teamMembers: Array<{
        id: string
        role: string
        title?: string
        equityBps?: number
        user?: {
            profile?: {
                name?: string
            }
        }
        inviteEmail?: string
    }>
}

const COLORS = [
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#F59E0B', // amber
    '#10B981', // green
    '#6366F1', // indigo
    '#EF4444', // red
    '#14B8A6', // teal
]

export function CapTable({ teamMembers }: CapTableProps) {
    // Calculate cap table data
    const capTableData: CapTableEntry[] = teamMembers
        .filter(member => member.equityBps && member.equityBps > 0)
        .map((member, index) => ({
            name: member.user?.profile?.name || member.inviteEmail || 'Team Member',
            equity: member.equityBps! / 100, // Convert basis points to percentage
            role: member.title || member.role.replace(/_/g, ' '),
            color: COLORS[index % COLORS.length]
        }))

    const totalAllocated = capTableData.reduce((sum, entry) => sum + entry.equity, 0)
    const unallocated = 100 - totalAllocated

    // Add unallocated if exists
    if (unallocated > 0) {
        capTableData.push({
            name: 'Unallocated',
            equity: unallocated,
            color: '#E5E7EB' // gray
        })
    }

    if (capTableData.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Percent className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No equity allocated yet</p>
                <p className="text-sm text-gray-500 mt-1">Add equity percentages to team members to see the cap table</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Equity Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={capTableData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: any) => `${entry.name}: ${entry.equity.toFixed(1)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="equity"
                        >
                            {capTableData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number | undefined) => value ? `${value.toFixed(2)}%` : '0%'} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Table View */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Equity
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {capTableData.map((entry, index) => (
                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-sm font-medium text-gray-900">{entry.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-600">{entry.role || '-'}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className="text-sm font-semibold text-gray-900">{entry.equity.toFixed(2)}%</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                        <tr>
                            <td className="px-6 py-3 text-sm font-bold text-gray-900" colSpan={2}>
                                Total Allocated
                            </td>
                            <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                                {totalAllocated.toFixed(2)}%
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
