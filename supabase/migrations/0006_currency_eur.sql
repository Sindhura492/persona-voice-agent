-- Switch guest-facing copy from CHF to EUR
update public.faq_entries
set
  answer_en = replace(answer_en, 'CHF', 'EUR'),
  answer_de = replace(answer_de, 'CHF', 'EUR')
where answer_en like '%CHF%' or answer_de like '%CHF%';
