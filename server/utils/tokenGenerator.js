import Counter from '../models/Counter.js';

const generateToken = async (prefix) => {
  const counter = await Counter.findOneAndUpdate(
    { key: prefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const date = new Date();
  const dateString = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  
  const seqString = counter.seq.toString().padStart(4, '0');
  
  return `NMM-${prefix}-${dateString}-${seqString}`;
};

export default generateToken;
