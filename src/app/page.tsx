import ActionCard from '../components/ActionCard';
import { actionCards, appTitle, appDescription } from '@/lib/data';

export default function Home() {
  return (
    <>
      <div className='flex gap-5 justify-center mt-5 mb-5'>
        {actionCards.map((card) => 
          <ActionCard 
            key={card.id} 
            header={card.header} 
            body={card.body} 
            footer={card.footer} 
            href={card.href} 
          />
        )}
      </div>
      <main>
        <div className='max-w-4xl mx-auto text-center px-8'>
          <h1 className='heading-primary'>{appTitle}</h1>
          <p className='text-muted'>{appDescription}</p>
        </div>
      </main>
    </>
  );
};
