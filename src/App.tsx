import MultiStepHeader from './components/MultiStepHeader/MultiStepHeader';
import NavigationButtons from './components/NavigationButtons';
import DetailsFormContainer from './containers/DetailsFormContainer';
import FilesContainer from './containers/FilesContainer';
import RequirementsContainer from './containers/RequirementsContainer';
import { useMultiStep } from './context/multiStep';
import { Steps } from './interfaces/enums';

export default function App() {
  const { currentStep, stepTitle } = useMultiStep();

  return (
    <>
      <section className="section">
        <MultiStepHeader />
        <h1 className="title text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-center">{stepTitle}</h1>
        <div className="container">
          <div className=" max-w-screen-sm flex-1">
            {currentStep === Steps.REQUIREMENTS && <RequirementsContainer />}
            {currentStep === Steps.DETAILS_FORM && <DetailsFormContainer />}
            {currentStep === Steps.CUSTOMERS_FILES && <FilesContainer />}
          </div>
        </div>
      </section>
    </>
  );
}
