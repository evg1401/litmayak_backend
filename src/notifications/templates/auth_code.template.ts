export const AUTH_CODE_EMAIL_SUBJECT = 'Ваш код авторизации';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildAuthCodePlaintext = (code: string): string =>
  [
    'Вы зарегистрировались в ЛитМаяк. Ваш пароль для входа:',
    '',
    code,
    '',
    'Никому не сообщайте и не пересылайте это письмо. Если вы не регистрировались, проигнорируйте его и напишите нам на почту support@litmayak.ru',
    '',
    'С уважением,',
    'команда ЛитМаяк',
  ].join('\n');

export const buildAuthCodeEmail = (code: string): string => `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${AUTH_CODE_EMAIL_SUBJECT}</title>
	<style type="text/css">
		html {
			-webkit-text-size-adjust: none;
			-ms-text-size-adjust: none;
		}
	</style>
	<style em="styles">
@media only screen and (max-device-width:660px),only screen and (max-width:660px) {
    .em-narrow-table {
        width: 100%!important;
        max-width: 660px!important;
        min-width: 320px!important;
    }
    .em-mob-wrap {
        display: block!important;
    }
    .em-mob-padding_right-20 {
        padding-right: 20px!important;
    }
    .em-mob-padding_left-20 {
        padding-left: 20px!important;
    }
    .em-mob-width-100perc {
        width: 100%!important;
        max-width: 100%!important;
    }
}
</style>
</head>
<body style="margin: 0; padding: 0;"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size: 1px; line-height: normal;" bgcolor="#F8F8F8">
		<tr em="group">
			<td align="center">
				<!--[if (gte mso 9)|(IE)]>
				<table cellpadding="0" cellspacing="0" border="0" width="660"><tr><td>
				<![endif]-->
				<table cellpadding="0" cellspacing="0" width="100%" border="0" style="max-width: 660px; min-width: 660px; width: 660px;" class="em-narrow-table">
<tr em="block" class="em-structure">
  <td align="center" style="padding: 30px 40px;" class="em-mob-padding_left-20 em-mob-padding_right-20">
    <table border="0" cellspacing="0" cellpadding="0" class="em-mob-width-100perc">
      <tr>
        <td width="580" valign="top" class="em-mob-wrap em-mob-width-100perc">
<table cellpadding="0" cellspacing="0" border="0" width="100%" class="em-mob-width-100perc" em="atom"><tr><td style="padding-bottom: 10px;" align="center">
  <div style="font-family: -apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif; font-size: 16px; line-height: 21px; color: #111111;">Вы зарегистрировались в ЛитМаяк. Ваш пароль для входа:<br><br><strong>${escapeHtml(code)}<br></strong><br>Никому не сообщайте и не пересылайте это письмо. Если вы не регистрировались, проигнорируйте его и напишите нам на почту support@litmayak.ru<br><br>С уважением,<br>команда ЛитМаяк</div>
</td></tr></table>
</td>
      </tr>
    </table>
  </td>
</tr>
</table>
				<!--[if (gte mso 9)|(IE)]>
				</td></tr></table>
				<![endif]-->
			</td>
		</tr>
	</table>
</body>
</html>`;
