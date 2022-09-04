import should from "should/as-function.js";

import { URLFixuperImpl } from "upload-to-danbooru/urlFixuper.js";

describe("URLFixuperImpl()", function() {
    const testCases = [
        {
            name: "bilibili",
            url: "https://i0.hdslb.com/bfs/album/7cebff5e5f45b17a7aba554bef68b6e84a5f483a.jpg@240w_320h_1e_1c.webp",
            expected: "https://i0.hdslb.com/bfs/album/7cebff5e5f45b17a7aba554bef68b6e84a5f483a.jpg",
        },
        {
            name: "discord",
            url: "https://media.discordapp.net/attachments/310432830138089472/722011243862556772/omegalbert_2.png?width=400&height=274",
            expected: "https://media.discordapp.net/attachments/310432830138089472/722011243862556772/omegalbert_2.png",
        },
        {
            name: "pinterest",
            url: "https://i.pinimg.com/736x/73/e8/2d/73e82d272de705bb8fad33e89c0543e5.jpg",
            expected: "https://i.pinimg.com/originals/73/e8/2d/73e82d272de705bb8fad33e89c0543e5.jpg",
        },
        {
            name: "fanbox",
            url: "https://pixiv.pximg.net/c/1620x580_90_a2_g5/fanbox/public/images/creator/228078/cover/tHi9VtLFvJW4RS1h1DVpttRQ.jpeg",
            expected: "https://pixiv.pximg.net/fanbox/public/images/creator/228078/cover/tHi9VtLFvJW4RS1h1DVpttRQ.jpeg",
        },
        {
            name: "booth",
            url: "https://booth.pximg.net/c/300x300_a2_g5/14df0a03-2f5f-4292-bb5a-94a3881df4f0/i/2926394/24c0b971-8807-4d40-8089-bdbf34089056_base_resized.jpg",
            expected: "https://booth.pximg.net/14df0a03-2f5f-4292-bb5a-94a3881df4f0/i/2926394/24c0b971-8807-4d40-8089-bdbf34089056.jpg",
        },
        {
            name: "fantia",
            url: "https://c.fantia.jp/uploads/post/file/709449/main_324b4503-c64b-428b-875c-eaa273861268.png",
            expected: "https://c.fantia.jp/uploads/post/file/709449/324b4503-c64b-428b-875c-eaa273861268.png",
        },
        {
            name: "imgix without signature",
            url: "https://anifty.imgix.net/creation/0x961d09077b4a9f7a27f6b7ee78cb4c26f0e72c18/20d5ce5b5163a71258e1d0ee152a0347bf40c7da.png?w=1200",
            expected: "https://anifty.imgix.net/creation/0x961d09077b4a9f7a27f6b7ee78cb4c26f0e72c18/20d5ce5b5163a71258e1d0ee152a0347bf40c7da.png",
        },
        {
            name: "imgix with signature",
            url: "https://skeb.imgix.net/uploads/origins/b1dd4098-687b-4a91-a345-bb34248e6d8e?bg=%23fff&auto=format&w=800&s=55a47927c4ab3f399ca4bfacd092f617",
            expected: "https://skeb.imgix.net/uploads/origins/b1dd4098-687b-4a91-a345-bb34248e6d8e?bg=%23fff&auto=format&w=800&s=55a47927c4ab3f399ca4bfacd092f617",
        },
    ];

    for (let t of testCases) {
        it("fix() " + t.name, function() {
            const uf = new URLFixuperImpl();

            should(uf.fix(t.url)).equal(t.expected);
        });
    }
});
