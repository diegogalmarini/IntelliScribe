import { supabase } from '../lib/supabase';
import { translateAllPlans, autoTranslateSetting } from '../services/aiTranslationService';

/**
 * Script de una sola ejecución para traducir contenido existente
 * Ejecutar con: npx tsx scripts/translate-initial-content.ts
 */

async function translateInitialContent() {
    console.log('[Translation Script] \ud83e\udd16 Starting initial translation...\n');

    try {
        // 1. Traducir planes existentes
        console.log('[1/2] Translating plans configuration...');
        const { data: plans, error: plansError } = await supabase
            .from('plans_configuration')
            .select('*')
            .eq('is_active', true);

        if (plansError) throw plansError;

        console.log(`Found ${plans.length} plans to translate`);

        const translatedPlans = await translateAllPlans(plans);

        // Actualizar cada plan con sus traducciones
        for (const plan of translatedPlans) {
            console.log(`\u2022 Updating plan: ${plan.name}`);

            const { error } = await supabase
                .from('plans_configuration')
                .update({
                    description_en: plan.description_en,
                    features_en: plan.features_en
                })
                .eq('id', plan.id);

            if (error) {
                console.error(`  \u274c Error updating ${plan.name}:`, error.message);
            } else {
                console.log(`  \u2705 ${plan.name} translated successfully`);
            }
        }

        // 2. Traducir footer legal
        console.log('\n[2/2] Translating legal footer...');
        const { data: footerData, error: footerError } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'legal_footer_text')
            .single();

        if (footerError) throw footerError;

        console.log('Found legal footer, translating...');
        const footerEn = await autoTranslateSetting(footerData.value);

        const { error: updateError } = await supabase
            .from('app_settings')
            .update({ value_en: footerEn })
            .eq('key', 'legal_footer_text');

        if (updateError) {
            console.error('\u274c Error updating footer:', updateError.message);
        } else {
            console.log('\u2705 Legal footer translated successfully');
        }

        console.log('\n\ud83c\udf89 Translation completed successfully!\n');
        console.log('Next steps:');
        console.log('1. Verify translations in Supabase SQL Editor');
        console.log('2. Test language switch in both Landing and Dashboard');
        console.log('3. Review any translations that may need manual adjustment');

    } catch (error: any) {
        console.error('\n\u274c Translation script failed:', error.message);
        process.exit(1);
    }
}

// Run the script
translateInitialContent();
