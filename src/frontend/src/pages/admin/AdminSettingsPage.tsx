import React from 'react';
import { useLanguage } from '../../i18n/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, FileText } from 'lucide-react';
import TermsManagementPanel from '../../components/admin/TermsManagementPanel';

export default function AdminSettingsPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('adminDashboard.title')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('adminDashboard.manageTerms')}
          </CardTitle>
          <CardDescription>
            Manage Terms & Conditions and Privacy Policy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TermsManagementPanel />
        </CardContent>
      </Card>
    </div>
  );
}
