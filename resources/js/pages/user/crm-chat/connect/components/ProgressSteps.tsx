import { Check } from 'lucide-react'

interface ProgressStepsProps {
    steps: string[]
    currentStep: number
}

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
    return (
        <div className="w-full mt-4">
            <div className="flex items-start justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1
                    const isActive = stepNumber === currentStep
                    const isCompleted = stepNumber < currentStep

                    return (
                        <div key={stepNumber} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                                <div className={`
                                    w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
                                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                                    ${isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : ''}
                                    ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400 border border-gray-200' : ''}
                                `}>
                                    {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                                </div>
                                <div className={`
                                    mt-2 text-[10px] text-center w-16
                                    ${isActive ? 'font-semibold text-blue-600' : ''}
                                    ${isCompleted ? 'text-green-600' : ''}
                                    ${!isActive && !isCompleted ? 'text-gray-400' : ''}
                                `}>
                                    {step}
                                </div>
                            </div>

                            {index < steps.length - 1 && (
                                <div className={`
                                    flex-1 h-0.5 mx-1 mb-5 transition-all
                                    ${stepNumber < currentStep ? 'bg-green-400' : 'bg-gray-200'}
                                `} />
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="text-center text-xs text-gray-500 mt-2">
                Step {currentStep} dari {steps.length}
            </div>
        </div>
    )
}
