import ActionCard from '../components/ActionCard';
import { actionCards, appTitle, appDescription } from '@/lib/data';

export default function Home() {
  return (
    <>
      <div className='flex gap-5 justify-center mt-5 mb-5'>
        {actionCards.map((card) => <ActionCard key={card.id} header={card.header} body={card.body} footer={card.footer}/>)}
      </div>
      <main>
        <div className='w-[90vw] flex flex-col mx-auto items-center justify-center'>
          <h1>{appTitle}</h1>
          <p>{appDescription}</p>
        </div>
      </main>
    </>
  );
}
