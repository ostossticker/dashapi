import getPrismaInstant from "./prisma.js";

export default function filterLowerCasePreserveCase(str){
    return str.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

function isNumeric(str) {
    return /^\d+$/.test(str);
  }

const prisma = getPrismaInstant()

export async function groupByWithInclude(model, fieldsToGroupBy, include, page, take, filter1, filter2, fromDate, toDate, tranformedFilter,role,busName) {
    const takenValue = +take;
    const skip = (+page - 1) * takenValue;
    
    const where = {
        AND:[
            role === 'ADMIN' ? {
                OR:[
                    {invNo:{contains:tranformedFilter,
                        mode: 'insensitive'
                    }},
                    {invCusPhone:{contains:tranformedFilter , mode:'insensitive'}},
                  isNumeric(tranformedFilter) ? 
                    {
                        customer:{
                            cusPhone1:{
                                contains:tranformedFilter,
                                mode: 'insensitive'
                            }
                        }
                    } : {
                      customer:{
                          cusName:{
                              contains:tranformedFilter,
                              mode: 'insensitive'
                          }
                      }
                    }
                ]
            } : {
                OR:[
                    {invNo:{contains:tranformedFilter,
                        mode: 'insensitive'
                    }},
                    {invCusPhone:{contains:tranformedFilter , mode:'insensitive'}},
                  isNumeric(tranformedFilter) ? 
                    {
                        customer:{
                            cusPhone1:{
                                contains:tranformedFilter,
                                mode: 'insensitive' 
                            }
                        }
                    } : {
                      customer:{
                          cusName:{
                              contains:tranformedFilter,
                              mode: 'insensitive'
                          }
                      }
                    }
                ],
                invBus:busName
            },
            filter1 ? {invBus:{contains:filter1}} : {},
            filter2 ? {invStatus:{contains:filter2}} : {},
            fromDate && toDate ? { updatedDate: { gte: new Date(fromDate), lte: new Date(toDate) } } : {},
            { deletedAt: null },
            { mode: 'invoice' }
        ]
    };
  
    let data 
    // Fetch data with pagination and filtering
         data = await prisma[model].findMany({
            where,
            include,
            take: takenValue,
            skip,
        });
      
    // Group data by specified fields
    const groupedData = {};
  
    data.forEach((item) => {
        // Generate key based on fields to group by
        const key = fieldsToGroupBy.map((field) => item.customer[field]).join('_') + '_' + item.invBus + '_' + item.invStatus + '_' + item.invCusPhone;
    
        if (!groupedData[key]) {
            groupedData[key] = {
                _max: { createdAt: item.createdAt, updatedAt: item.updatedAt },
                _min: { createdAt: item.createdAt, updatedAt: item.updatedAt },
                _sum: { balance: 0 },
                cusName1: item.customer.cusName,
                cusComp: item.customer.cusComp,
                invCusPhone1: item.customer.cusPhone1,
                invBus: item.invBus,
                invStatus: item.invStatus,
                invCusPhone: item.invCusPhone,
                cusNameCount: 0, // Initialize count to 0
            };
        }
    
        // Update _max and _min values
        groupedData[key]._max.createdAt = Math.max(groupedData[key]._max.createdAt, item.createdAt);
        groupedData[key]._max.updatedAt = Math.max(groupedData[key]._max.updatedAt, item.updatedAt);
        groupedData[key]._min.createdAt = Math.min(groupedData[key]._min.createdAt, item.createdAt);
        groupedData[key]._min.updatedAt = Math.min(groupedData[key]._min.updatedAt, item.updatedAt);
    
        // Update _sum values
        groupedData[key]._sum.balance += item.balance;
    
        // Increment cusNameCount for each item
        groupedData[key].cusNameCount++;
    });
  
    // Convert grouped data object to array of groups
    const result = Object.values(groupedData).map((group) => ({
        cusName1: group.cusName1,
        cusComp: group.cusComp,
        invCusPhone1: group.invCusPhone1,
        invBus: group.invBus,
        invStatus: group.invStatus,
        invCusPhone: group.invCusPhone,
        _max: group._max,
        _min: group._min,
        _sum: group._sum,
        cusNameCount: group.cusNameCount,
    }));
  
    return result;
  }
  
  