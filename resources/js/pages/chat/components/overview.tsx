import { motion } from 'framer-motion';

import { MessageIcon, VercelIcon } from '../../../components/icons';
import { InstagramIcon } from 'lucide-react';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      // @ts-ignore
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-0 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center pb-8">
          <VercelIcon size={32} />
          <span>+</span>
          <InstagramIcon size={32} />
        </p>
        <p dir='rtl' className='pb-2'>
          مرحبا! أنا د. براند، خبير في صناعة محتوى إنستغرام يجذب الجزايريين 🇩🇿. نساعدك تبني محتوى فيه الهوك والتشويق يخلي الناس تقول &quot;هذا أنا!&quot; وتشير لصحابها.
        </p>
        <p dir='rtl' className='pb-3'>
          سواء كنت صاحب بيزنس، فودي، ولا تحب السفر، عندنا أفكار تجيب ملاين المشاهدات! ابدأ دز بروفايلك وخلينا نطلعو ليك فولوورز.
        </p>
        <p
          className="font-medium underline underline-offset-8"
          dir='rtl'
        >
          جرب الآن
        </p>
      </div>
    </motion.div >
  );
};
