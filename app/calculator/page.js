import SavingsCalculator from './SavingCalculator';

export const metadata = {
    title: 'EV Savings Calculator — BudgetEV',
    description:
        'Calculate how much you save by switching to an electric vehicle. Compare petrol vs EV costs by month, year, and 5 years.',
};

export default function CalculatorPage() {
    return <SavingsCalculator />;
}