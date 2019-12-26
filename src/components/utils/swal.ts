import Swal from 'sweetalert2';
import { BASE_URL } from '../../store/api/config';

const twinsToTwinteAlert = () => {
  Swal.mixin({
    confirmButtonText: '次へ &rarr;',
    showCancelButton: true,
    progressSteps: ['1', '2', '3']
  })
    .queue([
      {
        title: 'Twinsからインポート',
        text:
          'メニューから「Twinsからインポートする」ボタンを押してTwinsにログインします。',
        imageUrl: 'https://www.twinte.net/_nuxt/img/214cb57.jpg',
        imageHeight: 300
      },
      {
        title: 'Twinsからインポート',
        text:
          '履修登録画面に行きます。まず「履修」ボタンを押してから、「履修登録・登録状況紹介」を押します。',
        imageUrl: 'https://www.twinte.net/_nuxt/img/834f6e7.jpg',
        imageHeight: 300
      },
      {
        title: 'Twinsからインポート',
        text:
          '「Twin:teにインポート」ボタンがあるので、タップします。すると、現在表示している学期の授業がインポートされます。',
        imageUrl: 'https://www.twinte.net/_nuxt/img/f9666f5.jpg',
        imageHeight: 300
      }
    ])
    .then(result => {
      if (result.value) {
        location.href = 'https://twins.tsukuba.ac.jp';
      }
    });
};

const loginAlert = () => {
  Swal.fire({
    title: 'どのアカウントでログインしますか?',
    html: `
      <p>
        Twin:teにログインしたことがない場合は自動的にアカウントが作成されます。
        <br />ログインをした場合、
        <a href="https://www.twinte.net/terms">利用規約</a>に同意したものとします。
      </p>
      <p>
        <a href="${BASE_URL}/auth/google">
          <img
            width="250"
            src="/authimg/btn_google_signin_light_normal_web@2x.png"
            alt="sign in with google"
          />
        </a>
      </p>
      <p>
        <a href="${BASE_URL}/auth/apple">
          <img
            width="250"
            src="/authimg/sign-in-with-apple.png"
            alt="SignInWithApple"
          />
        </a>
      </p>
      <p>
        <a href="${BASE_URL}/auth/twitter">
          <img
            width="250"
            src="/authimg/sign-in-with-twitter-gray.png"
            alt="ign-in-with-twitter"
          />
        </a>
      </p>
      `,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: '閉じる'
  });
};

export { twinsToTwinteAlert, loginAlert };
