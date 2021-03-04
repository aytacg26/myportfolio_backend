import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  website: {
    type: String,
    maxLength: 100,
  },
  location: {
    type: String,
    maxLength: 75,
  },
  contactInfo: {
    address: {
      street: {
        type: String,
        maxLength: 120,
      },
      city: {
        type: String,
        maxLenght: 30,
      },
      postCode: {
        type: String,
        maxLenght: 15,
      },
      fullAddress: {
        type: String,
        maxLength: 250,
      },
    },
    mobile: {
      type: String,
      maxLength: 15,
    },
    homePhone: {
      type: String,
      maxLength: 15,
    },
  },
  languages: {
    type: [
      {
        language: {
          type: String,
          maxLength: 30,
        },
        ISO639Code: {
          type: String,
          maxLength: 2,
        },
      },
    ],
    validate: [languageLimit, '{PATH} exceeds the limit of 20'],
  },
  status: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  birthDate: {
    type: Date,
  },
  githubusername: {
    type: String,
    maxLength: 40,
  },
  tellAboutYourself: {
    type: String,
    maxLenght: 8000,
  },
  experience: {
    type: [
      {
        title: {
          type: String,
          required: true,
          maxLength: 60,
        },
        company: {
          type: String,
          required: true,
          maxLength: 150,
        },
        location: {
          type: String,
          maxLength: 75,
        },
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: Date,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          maxLength: 1000,
        },
        salaryRange: {
          type: String,
          maxLength: 20,
        },
      },
    ],
    validation: [experienceLimit, '{PATH} exceeds the limit of 25'],
  },
  education: {
    type: [
      {
        school: {
          type: String,
          required: true,
          maxLength: 90,
        },
        degree: {
          type: String,
          required: true,
          maxLength: 30,
        },
        fieldOfStudy: {
          type: String,
          required: true,
          maxLength: 60,
        },
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: String,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          maxLength: 1000,
        },
      },
    ],
    validation: [educationLimit, '{PATH} exceeds the limit of 8'],
  },
  certificates: {
    type: [
      {
        subject: {
          type: String,
          required: true,
          maxLength: 80,
        },
        issuingOrganization: {
          type: String,
          required: true,
          maxLength: 100,
        },
        issueDate: {
          type: Date,
          required: true,
        },
        expirationDate: {
          type: String,
        },
        doesExpire: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          maxLength: 400,
        },
      },
    ],
    validation: [certificationLimit, '{PATH} exceeds the limit of 35'],
  },
  publications: {
    type: [
      {
        title: {
          type: String,
          required: true,
          maxLength: 120,
        },
        publishedDate: {
          type: Date,
          required: true,
        },
        language: {
          type: String,
          required: true,
          maxLength: 30,
        },
        description: {
          type: String,
          maxLength: 2000,
        },
      },
    ],
    validation: [publicationsLimit, '{PATH} exceeds the limit of 25'],
  },
  portfolio: {
    type: [
      {
        title: {
          type: String,
          required: true,
          maxLength: 100,
        },
        subject: {
          type: String,
          required: true,
          maxLength: 100,
        },
        targetAudience: {
          type: String,
          maxLength: 200,
        },
        dateOfCreation: {
          type: Date,
          required: true,
        },
        description: {
          type: String,
          maxLength: 6500,
        },
        projectDuration: {
          duration: {
            type: Number,
            max: 365,
          },
          unit: {
            type: String,
            maxLength: 20,
          },
        },
        toolsUsed: {
          type: [String],
        },
        imagesArray: {
          type: [
            {
              imageLink: {
                type: String,
              },
              imageDescription: {
                type: String,
                maxLenght: 500,
              },
              imageTitle: {
                type: String,
                maxLength: 100,
              },
              uploadDate: {
                type: Date,
                default: Date.now(),
              },
            },
          ],
          validation: [imageLimit, '{PATH} exceeds the limit of 25'], //image Limitation per portfolio
        },
        videoArray: {
          type: [
            {
              videoLink: {
                type: String,
              },
              videoDescription: {
                type: String,
                maxLenght: 500,
              },
              videoTitle: {
                type: String,
                maxLength: 100,
              },
              uploadDate: {
                type: Date,
                default: Date.now(),
              },
            },
          ],
          validation: [videoLimit, '{PATH} exceeds the limit of 5'], //video Limitation per portfolio
        },
        websiteLink: {
          type: String,
          maxLength: 100,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    validation: [portfolioLimit, '{PATH} exceeds the limit of 100'], //PortfolioLimitation
  },
  social: {
    youtube: {
      type: String,
      maxLength: 100,
    },
    twitter: {
      type: String,
      maxLength: 40,
    },
    facebook: {
      type: String,
      maxLength: 80,
    },
    linkedin: {
      type: String,
      maxLength: 100,
    },
    instagram: {
      type: String,
      maxLength: 100,
    },
  },
  posts: [
    {
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

function languageLimit(val) {
  val.length <= 20;
}

function experienceLimit(val) {
  val.length <= 25;
}

function educationLimit(val) {
  val.length <= 8;
}

function certificationLimit(val) {
  val.length <= 35;
}

function publicationsLimit(val) {
  val.length <= 25;
}

function portfolioLimit(val) {
  val.length <= 100;
}

function imageLimit(val) {
  val.length <= 25;
}

function videoLimit(val) {
  val.length <= 5;
}
