// models/Hotel.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Hotel Schema
 *
 * ⚠️ 필드들은 API 명세 기준으로 구성했음.
 *    친구 레포의 Hotel.js와 반드시 비교해서
 *    필드/타입/옵션을 100% 동일하게 맞출 것.
 */

const hotelSchema = new Schema(
    {
        // 호텔 이름
        name: {
            type: String,
            required: true,
            trim: true,
        },

        // 호텔 설명
        description: {
            type: String,
            trim: true,
        },

        // 도시(필터 city용)
        city: {
            type: String,
            required: true,
            trim: true,
        },

        // 상세 주소 (필요 없으면 친구 레포 기준으로 조정)
        address: {
            type: String,
            trim: true,
        },

        // 위치 - 문자열 or 객체로 쓰고 있다면 맞춰야 함 (확실하지 않음)
        location: {
            type: String,
            trim: true,
        },

        // 이미지 URL 배열
        images: [
            {
                type: String,
                trim: true,
            },
        ],

        // 편의시설 (amenities 필터용)
        amenities: [
            {
                type: String,
                trim: true,
            },
        ],

        // 평균 평점
        ratingAverage: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        // 리뷰 개수
        ratingCount: {
            type: Number,
            default: 0,
        },

        // 호텔 소유자 (사업자 / owner)
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // 승인 상태
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        // (선택) 기본 가격 정보 (검색용 캐시로 쓸 수 있음, 확실하지 않음)
        basePrice: {
            type: Number,
            default: 0,
        },

        // (선택) 기타 메타 정보 (태그, 추천, 인기 등)
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// 필요하면 가상 필드, 인덱스 등도 여기서 추가 가능
// 예: city + status 인덱스
hotelSchema.index({ city: 1, status: 1 });

const Hotel = mongoose.model("Hotel", hotelSchema);
export default Hotel;
