import React from 'react';

const ActivityFormInputs = ({ formData, handleChange, error }) => {
    return (
        <>
            {/* Description */}
            <div className="relative z-10 w-full">
                <label className="block text-[var(--t2)] font-ui font-bold text-xs uppercase tracking-widest mb-2">
                    Activity Description <span className="text-[var(--red)]">*</span>
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what you did, when, and where. Include specific details..."
                    rows="4"
                    className={`w-full bg-[var(--s2)] border ${error && !formData.description ? 'border-[var(--red)]' : 'border-[var(--b2)]'} text-[var(--t1)] font-ui px-4 py-3 rounded-xl focus:outline-none focus:border-[var(--v1)] focus:ring-1 focus:ring-[var(--v1)] transition-colors placeholder:text-[var(--t3)] resize-none`}
                />
                <p className="text-[10px] text-[var(--t2)] font-ui mt-1.5 ml-1">
                    Be detailed to help teachers verify your activity quickly.
                </p>
            </div>

            {/* Image Evidence */}
            <div className="relative z-0 w-full mt-6">
                <label className="block text-[var(--t2)] font-ui font-bold text-xs uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>Evidence Image URL <span className="text-[var(--red)]">*</span></span>
                    <span className="text-[10px] text-[var(--t3)] normal-case tracking-normal font-normal">Required for verification</span>
                </label>

                <div className="relative group">
                    <input
                        type="url"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className={`w-full bg-[var(--s2)] border ${error && !formData.imageUrl ? 'border-[var(--red)]' : 'border-[var(--b2)] group-hover:border-[var(--t3)]'} text-[var(--t1)] font-ui px-4 py-3 pl-10 rounded-xl focus:outline-none focus:border-[var(--v1)] focus:ring-1 focus:ring-[var(--v1)] transition-colors placeholder:text-[var(--t3)]`}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-50">📸</span>
                </div>

                {/* Image Preview Area */}
                {formData.imageUrl && (
                    <div className="mt-4 p-2 bg-[var(--s2)] border border-[var(--b2)] rounded-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img
                            src={formData.imageUrl}
                            alt="Preview"
                            className="w-full h-auto max-h-[250px] object-cover rounded-lg"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        {/* Fallback for bad URL */}
                        <div className="hidden w-full h-[150px] items-center justify-center flex-col text-[var(--t3)] bg-[var(--s1)] rounded-lg border border-dashed border-[var(--b2)]">
                            <span className="text-2xl mb-2">⚠️</span>
                            <span className="text-sm font-ui">Image Preview Unavailable</span>
                            <span className="text-[10px]">Check your URL</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ActivityFormInputs;
