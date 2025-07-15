export const getFunnelFixture = () => ({
  id: 'v5',
  version: 3,
  chapters: [
    {
      id: 'a',
      steps: [
        {
          id: 'landing',
          name: 'Landing',
          type: 'fact',
          parameters: {
            cta: 'Show me how',
            align: 'center',
            reverse: true,
            headline: 'Smart devs learn faster.<br/>Why not you?',
            explainer: 'We’ll help you stay sharp with less effort.',
            visualUrl:
              'https://media.daily.dev/image/upload/s--J7rMFv3U--/f_auto/v1745766945/public/Desk%20(1)',
            backgroundType: 'circleTop',
          },
          transitions: [{ on: 'complete', destination: 'motivation_rating' }],
        },
        {
          id: 'motivation_rating',
          name: 'Motivation Rating',
          type: 'quiz',
          parameters: {
            align: 'left',
            question: {
              text: 'How motivated are you to achieve this goal?',
              type: 'rating',
              options: [
                { label: 'Just exploring', value: '1' },
                { label: '2', value: '2' },
                { label: '3', value: '3' },
                { label: '4', value: '4' },
                { label: 'Fully committed', value: '5' },
              ],
              imageUrl:
                'https://media.daily.dev/image/upload/s--rcjG0mk2--/f_auto/v1743601373/public/motivation',
            },
          },
          transitions: [
            { on: 'complete', destination: 'motivation_fact' },
            { on: 'skip', destination: 'motivation_fact' },
          ],
        },
        {
          id: 'motivation_fact',
          name: 'Motivation Fact',
          type: 'fact',
          parameters: {
            cta: 'Show me how',
            align: 'center',
            headline: 'Staying motivated is about to become easier',
            explainer:
              'Even the most driven people hit roadblocks. We’re here to help turn your ambition into consistent progress. Ready?',
            visualUrl:
              'https://media.daily.dev/image/upload/s--bYnR2r2g--/f_auto/v1743601373/public/motivation-1',
          },
          transitions: [{ on: 'complete', destination: 'technologies' }],
        },
      ],
      title: 'A',
    },
    {
      id: 'b',
      steps: [
        {
          id: 'technologies',
          name: 'Technologies',
          type: 'quiz',
          parameters: {
            align: 'left',
            question: {
              cols: 2,
              text: 'What technologies do you already know?',
              type: 'multipleChoice',
              options: [
                {
                  image: {
                    alt: 'Python',
                    src: 'https://media.daily.dev/image/upload/s--0tGtGtGF--/f_auto/v1743491782/public/Icon01',
                  },
                  label: 'Python',
                  value: 'python',
                },
                {
                  image: {
                    alt: 'JavaScript',
                    src: 'https://media.daily.dev/image/upload/s--0QE7EIL6--/f_auto/v1743491782/public/Icon02',
                  },
                  label: 'JavaScript',
                  value: 'javascript',
                },
                {
                  image: {
                    alt: 'Java',
                    src: 'https://media.daily.dev/image/upload/s--jDC34ZAt--/f_auto/v1743491782/public/Icon03',
                  },
                  label: 'Java',
                  value: 'java',
                },
                {
                  image: {
                    alt: 'C#',
                    src: 'https://media.daily.dev/image/upload/s--vcmAB3O7--/f_auto/v1743491782/public/Icon04',
                  },
                  label: 'C#',
                  value: 'csharp',
                },
                {
                  image: {
                    alt: 'TypeScript',
                    src: 'https://media.daily.dev/image/upload/s--YWmnyt52--/f_auto/v1743491782/public/Icon05',
                  },
                  label: 'TypeScript',
                  value: 'typescript',
                },
                {
                  image: {
                    alt: 'Go',
                    src: 'https://media.daily.dev/image/upload/s--VRqomGTT--/f_auto/v1743491782/public/Icon06',
                  },
                  label: 'Go',
                  value: 'go',
                },
                {
                  image: {
                    alt: 'Rust',
                    src: 'https://media.daily.dev/image/upload/s--K0RuRqIZ--/f_auto/v1743491782/public/Icon07',
                  },
                  label: 'Rust',
                  value: 'rust',
                },
                {
                  image: {
                    alt: 'Kotlin',
                    src: 'https://media.daily.dev/image/upload/s--OZU4ruZh--/f_auto/v1743491782/public/Icon08',
                  },
                  label: 'Kotlin',
                  value: 'kotlin',
                },
                {
                  image: {
                    alt: 'Swift',
                    src: 'https://media.daily.dev/image/upload/s--XIK6eyBr--/f_auto/v1743491782/public/Icon09',
                  },
                  label: 'Swift',
                  value: 'swift',
                },
                {
                  image: {
                    alt: 'React Native',
                    src: 'https://media.daily.dev/image/upload/s--V_EkqUh7--/f_auto/v1743491782/public/Icon10',
                  },
                  label: 'React Native',
                  value: 'reactnative',
                },
                {
                  image: {
                    alt: 'Flutter',
                    src: 'https://media.daily.dev/image/upload/s--jKjyRGgD--/f_auto/v1743491782/public/Icon11',
                  },
                  label: 'Flutter',
                  value: 'flutter',
                },
                {
                  image: {
                    alt: 'AWS',
                    src: 'https://media.daily.dev/image/upload/s--qcf_l0q8--/f_auto/v1743491782/public/Icon12',
                  },
                  label: 'AWS',
                  value: 'aws',
                },
                {
                  image: {
                    alt: 'Docker',
                    src: 'https://media.daily.dev/image/upload/s--kJfnwLIi--/f_auto/v1743491782/public/Icon13',
                  },
                  label: 'Docker',
                  value: 'docker',
                },
                {
                  image: {
                    alt: 'Kubernetes',
                    src: 'https://media.daily.dev/image/upload/s--wFX6mXoi--/f_auto/v1743491782/public/Icon14',
                  },
                  label: 'Kubernetes',
                  value: 'kubernetes',
                },
                {
                  image: {
                    alt: '.NET',
                    src: 'https://media.daily.dev/image/upload/s--XR3zBuN0--/f_auto/v1743491782/public/Icon15',
                  },
                  label: '.NET',
                  value: 'dotnet',
                },
                {
                  image: {
                    alt: 'Google Cloud',
                    src: 'https://media.daily.dev/image/upload/s--k8qwryxr--/f_auto/v1743491782/public/Icon16',
                  },
                  label: 'Google Cloud',
                  value: 'googlecloud',
                },
                {
                  image: {
                    alt: 'Azure',
                    src: 'https://media.daily.dev/image/upload/s--_Ap9YD4X--/f_auto/v1743491782/public/Icon17',
                  },
                  label: 'Azure',
                  value: 'azure',
                },
                {
                  image: {
                    alt: 'TensorFlow',
                    src: 'https://media.daily.dev/image/upload/s--Gf4a42dy--/f_auto/v1743491782/public/Icon18',
                  },
                  label: 'TensorFlow',
                  value: 'tensorflow',
                },
                {
                  image: {
                    alt: 'PyTorch',
                    src: 'https://media.daily.dev/image/upload/s--l3B3ZxWc--/f_auto/v1743491782/public/Icon19',
                  },
                  label: 'PyTorch',
                  value: 'pytorch',
                },
                {
                  image: {
                    alt: 'Unity',
                    src: 'https://media.daily.dev/image/upload/s--k_z8C-vw--/f_auto/v1743491782/public/Icon20',
                  },
                  label: 'Unity',
                  value: 'unity',
                },
                {
                  image: {
                    alt: 'Unreal',
                    src: 'https://media.daily.dev/image/upload/s--sLKuBHal--/f_auto/v1743491782/public/Icon21',
                  },
                  label: 'Unreal',
                  value: 'unreal',
                },
                {
                  image: {
                    alt: 'Godot',
                    src: 'https://media.daily.dev/image/upload/s--uvRAv7Jl--/f_auto/v1743491782/public/Icon22',
                  },
                  label: 'Godot',
                  value: 'godot',
                },
              ],
            },
            explainer:
              'Selecting technologies allows us to curate content specifically for your interests.',
          },
          transitions: [
            { on: 'complete', destination: 'code_quality' },
            { on: 'skip', destination: 'code_quality' },
          ],
        },
        {
          id: 'code_quality',
          name: 'Code Quality',
          type: 'quiz',
          parameters: {
            align: 'left',
            question: {
              text: 'How confident are you in the quality of your code?',
              type: 'singleChoice',
              options: [
                { label: 'Very confident', value: 'very_confident' },
                { label: 'Somewhat confident', value: 'somewhat_confident' },
                {
                  label: 'Not as confident as I’d like',
                  value: 'not_confident',
                },
                { label: "I don't write code", value: 'no_code' },
              ],
            },
          },
          transitions: [
            { on: 'complete', destination: 'vibe_coding' },
            { on: 'skip', destination: 'vibe_coding' },
          ],
        },
        {
          id: 'vibe_coding',
          name: 'Vibe Coding',
          type: 'quiz',
          parameters: {
            align: 'left',
            question: {
              text: 'Have you ever tried vibe coding?',
              type: 'singleChoice',
              options: [
                { label: 'Yes! I love coding for fun 🤩', value: 'yes' },
                { label: 'No, but I’m curious 😀', value: 'curious' },
                { label: "I don't vibe code 🫣", value: 'no' },
              ],
            },
            explainer:
              'Vibe coding means coding casually or creatively, often using AI while listening to music or in a relaxed environment.',
          },
          transitions: [
            { on: 'complete', destination: 'pain_point' },
            { on: 'skip', destination: 'pain_point' },
          ],
        },
        {
          id: 'pain_point',
          name: 'Pain Point',
          type: 'quiz',
          parameters: {
            align: 'left',
            question: {
              text: 'How often do you feel out of the loop with new tech trends?',
              type: 'singleChoice',
              options: [
                { label: 'All the time', value: 'always' },
                { label: 'Sometimes', value: 'sometimes' },
                { label: 'Rarely', value: 'rarely' },
                { label: 'Never', value: 'never' },
              ],
            },
          },
          transitions: [
            { on: 'complete', destination: 'social_proof' },
            { on: 'skip', destination: 'social_proof' },
          ],
        },
      ],
      title: 'B',
    },
    {
      id: 'c',
      steps: [
        {
          id: 'social_proof',
          name: 'Social Proof',
          type: 'socialProof',
          parameters: {
            rating: '4.8/5',
            reviews: [
              {
                title: 'Finally something that respects how devs think',
                author: 'Marcus, Engineering Manager',
                content:
                  "\"It's curated, relevant, and doesn't treat me like a beginner. That's rare in this space.\"",
              },
              {
                title: 'Perfect for busy people',
                author: 'Taylor, Full-Stack Developer',
                content:
                  '"I used to spend hours sifting through Hacker News, Reddit, and newsletters. Now, I get everything I need in one place."',
              },
              {
                title: 'An absolute time-saver',
                author: 'Jordan, Backend Developer',
                content:
                  '"I was skeptical at first, but daily.dev genuinely helps me stay on top of tech without the noise."',
              },
              {
                title: "Exactly what I didn't know I needed",
                author: 'Lina, Frontend Engineer',
                content:
                  '"I thought I had my sources figured out. Turns out I was missing half the picture. daily.dev just gets what I care about."',
              },
              {
                title: 'Feels like it was built just for me',
                author: 'Carlos, ML Engineer',
                content:
                  "\"I don't have to search or filter anymore. The content shows up and it's always relevant. That's not luck—that's design.\"",
              },
              {
                title: 'The only tool I recommend without disclaimers',
                author: 'Leah, Systems Engineer',
                content:
                  '"I don\'t have to explain why I use daily.dev. Other devs just get it."',
              },
            ],
            imageUrl:
              'https://media.daily.dev/image/upload/s--44oMC43t--/f_auto/v1744094774/public/Rating',
            reviewSubtitle: 'based on 2,598+ reviews',
          },
          transitions: [{ on: 'complete', destination: 'process' }],
        },
        {
          id: 'process',
          name: 'Challenge Their Process',
          type: 'quiz',
          parameters: {
            align: 'left',
            question: {
              text: 'When you hear about a new technology, what do you normally do?',
              type: 'singleChoice',
              options: [
                {
                  label: 'Google it and hope for good results',
                  value: 'google',
                },
                { label: 'Wait for someone to tweet about it', value: 'wait' },
                { label: 'Check Hacker News or Reddit', value: 'competitors' },
                { label: 'I usually find out months later', value: 'later' },
                {
                  label: 'I already know about it because I have great sources',
                  value: 'already_know',
                },
              ],
            },
          },
          transitions: [
            { on: 'complete', destination: 'value_demo' },
            { on: 'skip', destination: 'value_demo' },
          ],
        },
        {
          id: 'value_demo',
          name: 'Value Demonstration',
          type: 'fact',
          parameters: {
            cta: 'Tell me more',
            align: 'center',
            headline: 'The best devs don’t waste time searching',
            explainer:
              'Most developers spend <b>250+ hours a year</b> hunting for quality content. That’s time you could spend on things you love. daily.dev delivers the best content, curated for you, in one place.',
            visualUrl:
              'https://media.daily.dev/image/upload/s--LZTD9dQr--/f_auto/v1743601373/public/Did%20you%20know',
          },
          transitions: [{ on: 'complete', destination: 'consistency' }],
        },
      ],
      title: 'C',
    },
    {
      id: 'd',
      steps: [
        {
          id: 'consistency',
          name: 'Consistency',
          type: 'quiz',
          parameters: {
            align: 'left',
            question: {
              text: 'How important is consistency in your learning routine?',
              type: 'singleChoice',
              options: [
                { label: 'Very important', value: 'important' },
                { label: 'Somewhat', value: 'somewhat' },
                { label: 'Not so important', value: 'not_important' },
              ],
            },
          },
          transitions: [
            { on: 'complete', destination: 'habit_proof' },
            { on: 'skip', destination: 'habit_proof' },
          ],
        },
        {
          id: 'habit_proof',
          name: 'Learning Habit Proof',
          type: 'fact',
          parameters: {
            cta: 'Got it',
            align: 'center',
            reverse: true,
            headline: 'Build long-lasting learning habits like a pro',
            explainer:
              'Developers actively using daily.dev are <b>3x more</b> likely to consistently learn compared to those using random sources. Build a learning habit and stay ahead effortlessly.',
            visualUrl:
              'https://media.daily.dev/image/upload/s--8pwBtlJx--/f_auto/v1743601373/public/graph',
          },
          transitions: [{ on: 'complete', destination: 'personalization' }],
        },
        {
          id: 'personalization',
          name: 'Personalization',
          type: 'loading',
          parameters: {
            headline: 'Lining up your next move...',
            explainer:
              'Based on everything you shared, we’re lining up insights that match where you’re headed. Give us a sec.',
          },
          transitions: [{ on: 'complete', destination: 'career' }],
        },
        {
          id: 'career',
          name: 'Career',
          type: 'fact',
          parameters: {
            cta: 'Let’s go',
            align: 'center',
            headline: 'Knowledge compounds.<br/> So does your value.',
            explainer:
              'The <b>highest-earning developers</b> aren’t just great at coding, they <b>stay current</b>. Staying informed gives you sharper instincts, better judgment, and a reputation that opens doors. Over time, <b>that adds up.</b>',
            visualUrl:
              'https://media.daily.dev/image/upload/s--yysiwuek--/f_auto/v1743601373/public/career',
            backgroundType: 'default',
          },
          transitions: [{ on: 'complete', destination: 'pricing' }],
        },
        {
          id: 'pricing',
          name: 'Pricing',
          type: 'pricing',
          parameters: {
            cta: 'Proceed to checkout →',
            faq: [
              {
                answer:
                  "Yes. You can cancel your plan at any point from your account settings. You'll keep access until the end of your billing cycle.",
                question: 'Can I cancel anytime?',
              },
              {
                answer:
                  "We'll send personalized nudges to help you stay consistent, and your feed will always be waiting. No FOMO required.",
                question: 'What happens if I forget to use it?',
              },
              {
                answer:
                  "Absolutely. daily.dev is built for anyone in tech. From junior devs to DevOps, PMs, and hobbyists. If you want to stay sharp, it's for you.",
                question: "Is this useful if I'm not a full-time developer?",
              },
            ],
            perks: [
              '30-day refund, no questions asked',
              'Cancel anytime, no strings attached',
              'Works across all your devices',
            ],
            plans: [
              {
                badge: { text: 'Popular', background: '#CE3DF3' },
                label: 'Monthly',
                priceId: 'pri_01jbsccbdbcwyhdy8hy3c2etyn',
              },
              {
                badge: { text: 'Save 50%', background: '#39E58C' },
                label: 'Annual',
                priceId: 'pri_01jbscda57910yvwjtyapnrrzc',
                variation: 'best_value',
              },
            ],
            refund: {
              image:
                'https://media.daily.dev/image/upload/s--QHvr7zBd--/f_auto/v1743491782/public/approved',
              title: '100% money back guarantee',
              content:
                "We're confident in the quality of our plan. More than a million developers around the world use daily.dev to grow professionally. To get the most out of it, use daily.dev daily. Consume content, explore, and interact with the community. If you still don't love it after 30 days, contact us. We guarantee a full hassle-free refund. No questions asked.",
            },
            review: {
              image:
                'https://media.daily.dev/image/upload/s--ZOzmj3AB--/f_auto/v1743939472/public/Review',
              authorInfo: 'Dave N., Senior Software Engineer',
              reviewText:
                'This is the only tool I’ve stuck with for more than a month. It fits naturally into my routine and keeps me sharp.',
              authorImage:
                'https://media.daily.dev/image/upload/s--FgjC22Px--/f_auto/v1743491782/public/image',
            },
            discount: {
              message:
                'Get <b>additional 20% discount</b> if you subscribe in the next 15 minutes',
              duration: 15,
            },
            headline: 'Choose your plan',
            defaultPlan: 'pri_01jbscda57910yvwjtyapnrrzc',
            featuresList: {
              items: [
                'Curated tech content from all over the web',
                'Personalized feed based on your interests',
                'AI assistant to explain complex topics',
                'Distraction-free reading mode',
                'Save posts for later and organize with folders',
                'Discover trending tools early',
                'Engage with like-minded professionals',
                'Exclusive content from top creators',
              ],
              title: 'Your new abilities',
            },
          },
          transitions: [{ on: 'complete', destination: 'registration' }],
        },
        {
          id: 'registration',
          name: 'Registration',
          type: 'registration',
          parameters: {
            image:
              'https://media.daily.dev/image/upload/s--qXQmo4wm--/f_auto/v1744883942/public/login%20background%20web%201%20(1)',
            headline:
              'Yes, this is the signup screen<br/><b>Let’s get things set up</b>',
            imageMobile:
              'https://media.daily.dev/image/upload/s--r4MiKjLD--/f_auto/v1743601527/public/login%20background',
          },
          transitions: [{ on: 'complete', destination: 'checkout' }],
        },
        {
          id: 'checkout',
          name: 'Checkout',
          type: 'checkout',
          parameters: { discountCode: 'dsc_01jr577nnphy2mgckh0r56yjf2' },
          transitions: [{ on: 'complete', destination: 'payment_successful' }],
        },
        {
          id: 'payment_successful',
          name: 'Payment Successful',
          type: 'paymentSuccessful',
          parameters: {},
          transitions: [{ on: 'complete', destination: 'finish' }],
        },
      ],
      title: 'D',
    },
  ],
  parameters: {},
  entryPoint: 'landing',
});
