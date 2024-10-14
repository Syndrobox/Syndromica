const blocks = {
  '4gems': {
    gems: 4,
    iosProducts: ['com.syndrobox.ios.syndromica.4gems'],
    androidProducts: ['com.syndrobox.android.syndromica.iap.4gems'],
    price: 99, // in cents, web only
  },
  '21gems': {
    gems: 21,
    iosProducts: [
      'com.syndrobox.ios.syndromica.20gems',
      'com.syndrobox.ios.syndromica.21gems',
    ],
    androidProducts: [
      'com.syndrobox.android.syndromica.iap.20.gems',
      'com.syndrobox.android.syndromica.iap.21.gems',
    ],
    price: 499, // in cents, web only
  },
  '42gems': {
    gems: 42,
    iosProducts: ['com.syndrobox.ios.syndromica.42gems'],
    androidProducts: ['com.syndrobox.android.syndromica.iap.42gems'],
    price: 999, // in cents, web only
  },
  '84gems': {
    gems: 84,
    iosProducts: ['com.syndrobox.ios.syndromica.84gems'],
    androidProducts: ['com.syndrobox.android.syndromica.iap.84gems'],
    price: 1999, // in cents, web only
  },
};

// Add the block key to all blocks
Object.keys(blocks).forEach(blockKey => {
  const block = blocks[blockKey];
  block.key = blockKey;
});

export default blocks;
