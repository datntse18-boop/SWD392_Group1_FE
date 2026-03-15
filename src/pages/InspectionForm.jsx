import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Save, Loader2 } from 'lucide-react';
import { completeInspectionReport, getPendingInspectionRequests } from '@/services/api';

export default function InspectionForm() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchingRequest, setFetchingRequest] = useState(false);
    const [requestData, setRequestData] = useState(location.state?.request || null);
    const [submitError, setSubmitError] = useState('');
    const [reportFile, setReportFile] = useState(null);

    const [formParams, setFormParams] = useState({
        result: 'passed',
        frameStatus: 'Good',
        brakesStatus: 'Good',
        drivetrainStatus: 'Good',
        wheelsStatus: 'Good',
        generalCondition: 'Minor wear and tear',
        inspectorNotes: '',
    });

    useEffect(() => {
        const loadRequestById = async () => {
            if (requestData) return;

            setFetchingRequest(true);
            try {
                const data = await getPendingInspectionRequests();
                const found = (Array.isArray(data) ? data : []).find(
                    (item) => Number(item.reportId || item.inspectionReportId || item.id) === Number(id)
                );

                if (found) {
                    setRequestData({
                        reportId: found.reportId || found.inspectionReportId || found.id,
                        bikeId: found.bikeId || found.bike?.bikeId,
                        title: found.bikeTitle || found.title || found.bike?.title || 'Untitled Bike',
                        seller: found.sellerName || found.seller?.fullName || found.bike?.sellerName || 'Unknown Seller',
                    });
                }
            } finally {
                setFetchingRequest(false);
            }
        };

        loadRequestById();
    }, [id, requestData]);

    const handleChange = (e) => {
        setFormParams({
            ...formParams,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError('');

        try {
            const normalizedComment = [formParams.generalCondition, formParams.inspectorNotes]
                .map((value) => (value || '').trim())
                .filter(Boolean)
                .join('\n');

            const payload = {
                result: formParams.result,
                frameCondition: formParams.frameStatus,
                brakeCondition: formParams.brakesStatus,
                drivetrainCondition: formParams.drivetrainStatus,
                overallComment: normalizedComment || null,
                reportFile: reportFile ? reportFile.name : null,
            };

            await completeInspectionReport(Number(id), payload);
            navigate('/inspector-dashboard');
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Submission failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/inspector-dashboard')}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Pending List
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-gray-800">
                    <div className="px-8 py-6 border-b border-gray-100 bg-teal-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-teal-900">
                                    Bike Inspection
                                </h1>
                                <p className="text-sm text-teal-800 mt-1">
                                    {fetchingRequest
                                        ? 'Loading request details...'
                                        : `Checking Bike #${requestData?.bikeId || '--'}${requestData?.title ? ` • ${requestData.title}` : ''}`}
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-bold rounded-full uppercase tracking-wide">
                                Pending Review
                            </span>
                        </div>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* Component Checklist */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-teal-600" />
                                    Component Checklist
                                </h3>

                                <div className="space-y-2">
                                    <label htmlFor="result" className="text-sm font-medium text-gray-700">Inspection Result</label>
                                    <select
                                        id="result"
                                        value={formParams.result}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 border py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                                    >
                                        <option value="passed">Passed</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="frameStatus" className="text-sm font-medium text-gray-700">Frame & Fork</label>
                                        <select
                                            id="frameStatus"
                                            value={formParams.frameStatus}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 border py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                                        >
                                            <option>Excellent</option>
                                            <option>Good</option>
                                            <option>Fair (Scratches/Chips)</option>
                                            <option>Poor (Cracks/Dents)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="brakesStatus" className="text-sm font-medium text-gray-700">Brakes</label>
                                        <select
                                            id="brakesStatus"
                                            value={formParams.brakesStatus}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 border py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                                        >
                                            <option>Excellent</option>
                                            <option>Good</option>
                                            <option>Needs Bleed/Pads</option>
                                            <option>Broken</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="drivetrainStatus" className="text-sm font-medium text-gray-700">Drivetrain</label>
                                        <select
                                            id="drivetrainStatus"
                                            value={formParams.drivetrainStatus}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 border py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                                        >
                                            <option>Excellent</option>
                                            <option>Good</option>
                                            <option>Worn Chain/Cassette</option>
                                            <option>Needs Tuning</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="wheelsStatus" className="text-sm font-medium text-gray-700">Wheels & Tires</label>
                                        <select
                                            id="wheelsStatus"
                                            value={formParams.wheelsStatus}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 border py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                                        >
                                            <option>Excellent</option>
                                            <option>Good</option>
                                            <option>Spokes loose/Out of true</option>
                                            <option>Tires worn out</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Notes */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-teal-600" />
                                    Detailed Assessment
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="generalCondition" className="text-sm font-medium text-gray-700">General Overview</label>
                                        <input
                                            type="text"
                                            id="generalCondition"
                                            value={formParams.generalCondition}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                            placeholder="e.g. Minor wear and tear, mostly aesthetic."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="inspectorNotes" className="text-sm font-medium text-gray-700">Inspector's Official Notes</label>
                                        <textarea
                                            id="inspectorNotes"
                                            rows="5"
                                            value={formParams.inspectorNotes}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                            placeholder="Detail any specific flaws. Will the bike pass inspection, or does it require seller repairs?"
                                        ></textarea>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="reportFile" className="text-sm font-medium text-gray-700">Inspection Report File (optional)</label>
                                        <input
                                            id="reportFile"
                                            type="file"
                                            onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                                            className="block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {submitError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                                    {submitError}
                                </div>
                            )}

                            {/* Submit Area */}
                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                                <button
                                    type="button"
                                    className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => navigate('/inspector-dashboard')}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-sm"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {loading ? 'Saving...' : 'Complete Inspection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
