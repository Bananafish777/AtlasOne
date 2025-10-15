import { NextResponse } from 'next/server';

// 这是一个示例 API 路由，用于返回位置数据
// 实际使用时，你可以从数据库或外部 API 获取数据
export async function GET() {
  try {
    // 示例：从外部 API 获取数据
    // const response = await fetch('https://your-api.com/locations');
    // const data = await response.json();
    
    // 或者从数据库获取
    // const data = await db.locations.findMany();

    // 这里返回示例数据
    const itinerary = {
      days: [
        {
          date: "2025-10-10",
          items: [
            {
              id: "1",
              title: "Tokyo Tower",
              timeWindow: "09:00 - 11:00",
              location: { 
                city: "Tokyo", 
                lat: 35.6586, 
                lng: 139.7454 
              },
              bookingUrl: null
            },
            {
              id: "2",
              title: "Senso-ji Temple",
              timeWindow: "13:00 - 15:00",
              location: { 
                city: "Tokyo", 
                lat: 35.7148, 
                lng: 139.7967 
              },
              bookingUrl: null
            }
          ]
        },
        {
          date: "2025-10-11",
          items: [
            {
              id: "3",
              title: "Mount Fuji",
              timeWindow: "08:00 - 17:00",
              location: { 
                city: "Fuji", 
                lat: 35.3606, 
                lng: 138.7274 
              },
              bookingUrl: "https://example.com/fuji"
            }
          ]
        }
      ]
    };

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// POST 方法用于接收和保存新的位置数据
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 这里可以验证数据格式
    if (!data.days || !Array.isArray(data.days)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // 保存到数据库或转发到后端 API
    // await db.locations.create({ data });
    // 或
    // await fetch('https://your-backend-api.com/locations', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // });

    return NextResponse.json({ 
      success: true, 
      message: 'Locations saved successfully' 
    });
  } catch (error) {
    console.error('Error saving locations:', error);
    return NextResponse.json(
      { error: 'Failed to save locations' },
      { status: 500 }
    );
  }
}
