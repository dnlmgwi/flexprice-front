import { Button, FormHeader, Input, Sheet, Spacer, Textarea, Toggle } from '@/components/atoms';
import { FC, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import FeatureApi from '@/api/FeatureApi';
import toast from 'react-hot-toast';
import { refetchQueries } from '@/core/services/tanstack/ReactQueryProvider';
import { UpdateFeatureRequest } from '@/types/dto/Feature';
import Feature, { FEATURE_TYPE } from '@/models/Feature';

interface Props {
	data: Feature; // Required - update-only drawer
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	trigger?: React.ReactNode;
	refetchQueryKeys?: string | string[];
}

const FeatureDrawer: FC<Props> = ({ data, open, onOpenChange, trigger, refetchQueryKeys }) => {
	const [formData, setFormData] = useState<UpdateFeatureRequest>({
		name: data?.name || '',
		description: data?.description || '',
		unit_singular: data?.unit_singular || '',
		unit_plural: data?.unit_plural || '',
		display_unit_singular: data?.display_unit_singular || '',
		display_unit_plural: data?.display_unit_plural || '',
		unit_conversion_factor: data?.unit_conversion_factor,
	});
	const [showDisplayUnits, setShowDisplayUnits] = useState(!!data?.display_unit_singular);
	const [conversionInput, setConversionInput] = useState(data?.unit_conversion_factor?.toString() || '');
	const [errors, setErrors] = useState<Partial<Record<keyof UpdateFeatureRequest, string>>>({});

	const isMeteredType = data?.type === FEATURE_TYPE.METERED;

	const { mutate: updateFeature, isPending } = useMutation({
		mutationFn: (updateData: UpdateFeatureRequest) => {
			return FeatureApi.updateFeature(data.id, updateData);
		},
		onSuccess: () => {
			toast.success('Feature updated successfully');
			onOpenChange?.(false);
			refetchQueries(refetchQueryKeys);
		},
		onError: (error: ServerError) => {
			toast.error(error.error.message || 'Failed to update feature. Please try again.');
		},
	});

	useEffect(() => {
		if (data) {
			setFormData({
				name: data.name || '',
				description: data.description || '',
				unit_singular: data.unit_singular || '',
				unit_plural: data.unit_plural || '',
				display_unit_singular: data.display_unit_singular || '',
				display_unit_plural: data.display_unit_plural || '',
				unit_conversion_factor: data.unit_conversion_factor,
			});
			setShowDisplayUnits(!!data.display_unit_singular);
			setConversionInput(data.unit_conversion_factor?.toString() || '');
		}
		setErrors({});
	}, [data, open]);

	const validateForm = () => {
		const newErrors: Partial<Record<keyof UpdateFeatureRequest, string>> = {};

		if (!formData.name?.trim()) {
			newErrors.name = 'Name is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = () => {
		if (!validateForm()) {
			return;
		}

		const updateDto: UpdateFeatureRequest = {
			name: formData.name?.trim(),
			description: formData.description?.trim() || undefined,
			unit_singular: formData.unit_singular?.trim() || undefined,
			unit_plural: formData.unit_plural?.trim() || undefined,
			display_unit_singular: showDisplayUnits ? formData.display_unit_singular?.trim() || undefined : undefined,
			display_unit_plural: showDisplayUnits ? formData.display_unit_plural?.trim() || undefined : undefined,
			unit_conversion_factor: showDisplayUnits ? formData.unit_conversion_factor : undefined,
		};

		updateFeature(updateDto);
	};

	const handleConversionFactorChange = (value: string) => {
		if (/^\d*\.?\d*$/.test(value)) {
			setConversionInput(value);
			const num = parseFloat(value);
			setFormData({ ...formData, unit_conversion_factor: !isNaN(num) ? num : undefined });
		}
	};

	const handleToggleDisplayUnits = (enabled: boolean) => {
		setShowDisplayUnits(enabled);
		if (!enabled) {
			setFormData({
				...formData,
				display_unit_singular: '',
				display_unit_plural: '',
				unit_conversion_factor: undefined,
			});
			setConversionInput('');
		}
	};

	const isCtaDisabled = !formData.name?.trim() || isPending;

	const reportedUnit = formData.unit_singular || 'reported unit';
	const displayUnit = formData.display_unit_singular || 'display unit';
	const conversionFactor = conversionInput || 'conversion factor';

	return (
		<Sheet isOpen={open} onOpenChange={onOpenChange} title='Edit Feature' description='Update feature details.' trigger={trigger}>
			<div className='space-y-8 mt-4'>
				<Input
					label='Name'
					placeholder='Enter feature name'
					value={formData.name || ''}
					error={errors.name}
					onChange={(e) => {
						setFormData({ ...formData, name: e });
					}}
				/>

				<Textarea
					label='Description'
					placeholder='Enter description'
					value={formData.description || ''}
					onChange={(e) => {
						setFormData({ ...formData, description: e });
					}}
					className='min-h-[100px]'
				/>

				{isMeteredType && (
					<>
						<div>
							<FormHeader variant='form-component-title' title='Measuring Units' subtitle='Define the units in which usage events are reported.' />
							<div className='gap-4 grid grid-cols-2'>
								<Input
									label='Singular'
									placeholder='e.g. millisecond'
									value={formData.unit_singular || ''}
									onChange={(e) => {
										setFormData({ ...formData, unit_singular: e, unit_plural: e + 's' });
									}}
								/>
								<Input
									label='Plural'
									placeholder='e.g. milliseconds'
									value={formData.unit_plural || ''}
									onChange={(e) => {
										setFormData({ ...formData, unit_plural: e });
									}}
								/>
							</div>
						</div>

						<Toggle
							checked={showDisplayUnits}
							onChange={handleToggleDisplayUnits}
							label='Use different display units'
							description='Enable this if you want to display usage in a different unit than what is reported.'
						/>

						{showDisplayUnits && (
							<>
								<div>
									<FormHeader variant='form-component-title' title='Display Units' subtitle='The units shown to users across the platform.' />
									<div className='gap-4 grid grid-cols-2'>
										<Input
											label='Display Singular'
											placeholder='e.g. minute'
											value={formData.display_unit_singular || ''}
											onChange={(e) => {
												setFormData({ ...formData, display_unit_singular: e, display_unit_plural: e + 's' });
											}}
										/>
										<Input
											label='Display Plural'
											placeholder='e.g. minutes'
											value={formData.display_unit_plural || ''}
											onChange={(e) => {
												setFormData({ ...formData, display_unit_plural: e });
											}}
										/>
									</div>
								</div>

								<Input
									label='Conversion Factor'
									placeholder='e.g. 0.0000166667'
									value={conversionInput}
									onChange={handleConversionFactorChange}
									description={`1 ${displayUnit} = ${conversionFactor} × ${reportedUnit}`}
								/>
							</>
						)}
					</>
				)}

				{!isMeteredType && (
					<>
						<Input
							label='Unit Singular'
							placeholder='e.g., unit'
							value={formData.unit_singular || ''}
							onChange={(e) => {
								setFormData({ ...formData, unit_singular: e });
							}}
						/>

						<Input
							label='Unit Plural'
							placeholder='e.g., units'
							value={formData.unit_plural || ''}
							onChange={(e) => {
								setFormData({ ...formData, unit_plural: e });
							}}
						/>
					</>
				)}

				<Spacer className='!h-4' />
				<Button isLoading={isPending} disabled={isCtaDisabled} onClick={handleSave}>
					Save Feature
				</Button>
			</div>
		</Sheet>
	);
};

export default FeatureDrawer;
